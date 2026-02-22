/**
 * Markdown Extensions
 * 統一管理自訂 Markdown 語法與圖片網格排版。
 */

const MarkdownExtensions = (function () {
    'use strict';

    const VERSION = '2.1.0';
    const MOBILE_BREAKPOINT = 768;
    const DEFAULT_ASPECT_RATIO = 16 / 9;
    const MIN_ASPECT_RATIO = 0.2;
    const MAX_ASPECT_RATIO = 6;
    const DEFAULT_LINE_BREAK_COUNT = 1;
    const MAX_LINE_BREAK_COUNT = 6;

    let markedConfigured = false;

    let config = {
        gridHeight: 280,
        gridGap: 8,
        debug: false
    };

    /**
     * 除錯輸出：僅在 debug 模式下輸出。
     */
    function log(...args) {
        if (config.debug) {
            console.log('[MarkdownExtensions]', ...args);
        }
    }

    /**
     * 轉義 HTML 特殊字元，避免注入與破版。
     */
    function escapeHtml(text = '') {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * 清理網址輸入，阻擋 javascript: 協定。
     */
    function sanitizeUrl(rawUrl = '') {
        const trimmed = String(rawUrl).trim();
        if (!trimmed) return '';

        const lowered = trimmed.toLowerCase();
        if (lowered.startsWith('javascript:')) return '';

        return escapeHtml(trimmed);
    }

    /**
     * 讀取 CSS 變數數值，無效時使用後備值。
     */
    function getCSSVariable(name, fallback) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(name);
        return parseInt(value, 10) || fallback;
    }

    /**
     * 判斷是否為行動版 viewport。
     */
    function isMobileViewport() {
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    }

    /**
     * 取得圖片在 grid 中的實際排版元素。
     */
    function getGridItemElement(image) {
        const mediaFigure = image.closest('.media-image-figure');
        if (mediaFigure && mediaFigure.closest('.image-grid')) {
            return mediaFigure;
        }

        return image;
    }

    /**
     * 清除圖片 justify 產生的 inline style。
     */
    function resetImageStyles(images) {
        images.forEach((img) => {
            const gridItem = getGridItemElement(img);
            gridItem.style.removeProperty('width');
            gridItem.style.removeProperty('flex-grow');
            gridItem.style.removeProperty('flex-shrink');

            img.style.removeProperty('width');
            img.style.removeProperty('flex-grow');
            img.style.removeProperty('flex-shrink');
            img.setAttribute('data-justified', 'true');
        });
    }

    /**
     * 取得安全的圖片長寬比，並限制在合理範圍。
     */
    function getSafeAspectRatio(image) {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return DEFAULT_ASPECT_RATIO;
        }

        const rawRatio = width / height;
        if (!Number.isFinite(rawRatio) || rawRatio <= 0) {
            return DEFAULT_ASPECT_RATIO;
        }

        return Math.min(Math.max(rawRatio, MIN_ASPECT_RATIO), MAX_ASPECT_RATIO);
    }

    /**
     * 等待圖片載入完成（成功或失敗皆返回）。
     */
    function waitForImageLoad(image) {
        return new Promise((resolve) => {
            if (image.complete) {
                resolve(image);
                return;
            }

            const finalize = () => {
                image.removeEventListener('load', finalize);
                image.removeEventListener('error', finalize);
                resolve(image);
            };

            image.addEventListener('load', finalize, { once: true });
            image.addEventListener('error', finalize, { once: true });
        });
    }

    /**
     * 渲染媒體說明文字（可選）。
     */
    function renderCaption(rawTitle = '') {
        const title = rawTitle.trim();
        if (!title) return '';
        return `<figcaption class="media-caption">${escapeHtml(title)}</figcaption>`;
    }

    /**
     * 產生統一的 figure 結構，並附加可選 caption。
     */
    function renderFigure(contentHtml, captionTitle = '', classNames = []) {
        const classes = ['media-figure', ...classNames].join(' ').trim();
        const caption = renderCaption(captionTitle);

        if (caption) {
            return `<figure class="${classes}">\n${contentHtml}\n${caption}\n</figure>`;
        }

        return `<figure class="${classes}">\n${contentHtml}\n</figure>`;
    }

    /**
     * 渲染頁首封面區塊。
     */
    function renderCover(url) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        return `<div class="notion-cover"><img src="${safeUrl}" alt="Cover" loading="lazy"></div>`;
    }

    /**
     * 渲染圖片 figure（alt 同時作為 caption 來源）。
     */
    function renderImage(url, altText) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanAlt = String(altText || '').trim();
        const safeAlt = escapeHtml(cleanAlt);
        const imageHtml = `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;

        return renderFigure(imageHtml, cleanAlt, ['media-image-figure']);
    }

    /**
     * 渲染影片播放器區塊。
     */
    function renderVideo(url, title) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const safeTitle = escapeHtml(cleanTitle);
        const titleAttribute = cleanTitle ? ` title="${safeTitle}"` : '';
        const videoHtml = `<video controls class="project-video"${titleAttribute}><source src="${safeUrl}" type="video/mp4"></video>`;

        return renderFigure(videoHtml, cleanTitle);
    }

    /**
     * 渲染 iframe 嵌入區塊。
     */
    function renderIframe(url, title) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const safeTitle = escapeHtml(cleanTitle || 'Embedded content');
        const iframeHtml = `<div class="iframe-container"><iframe src="${safeUrl}" loading="lazy" title="${safeTitle}"></iframe></div>`;

        return renderFigure(iframeHtml, cleanTitle);
    }

    /**
     * 生成平均分配比例（例如 3 欄 -> 33.333...）。
     */
    function getEvenRatios(count) {
        if (count <= 0) return [];
        const evenRatio = 100 / count;
        return Array.from({ length: count }, () => evenRatio);
    }

    /**
     * 解析 layout 比例字串，失敗時回退為平均比例。
     */
    function parseLayoutRatios(rawRatios, slotCount) {
        const fallbackRatios = getEvenRatios(slotCount);
        if (!rawRatios) return fallbackRatios;

        const ratioValues = rawRatios
            .split(/[^0-9.]+/g)
            .map((value) => parseFloat(value))
            .filter((value) => Number.isFinite(value) && value > 0);

        if (ratioValues.length !== slotCount) return fallbackRatios;

        const ratioTotal = ratioValues.reduce((sum, value) => sum + value, 0);
        if (ratioTotal <= 0) return fallbackRatios;

        return ratioValues.map((value) =>
            Number(((value / ratioTotal) * 100).toFixed(4))
        );
    }

    /**
     * 將比例陣列轉為 CSS grid-template-columns 片段。
     */
    function toGridColumnsTemplate(ratios) {
        if (!Array.isArray(ratios) || ratios.length === 0) {
            return 'minmax(0, 1fr)';
        }

        return ratios
            .map((ratio) => `minmax(0, ${ratio}fr)`)
            .join(' ');
    }

    /**
     * 解析 @video/@iframe 這類指令格式。
     */
    function parseMediaDirective(src, directiveName) {
        const directivePattern = new RegExp(`^@${directiveName}\\s*\\[([^\\]]*)\\]\\s*\\((.*)\\)\\s*(?:\\n|$)`);
        const match = directivePattern.exec(src);
        if (!match) return null;

        return {
            raw: match[0],
            title: match[1].trim(),
            url: match[2].trim()
        };
    }

    /**
     * 將分行次數正規化到安全範圍。
     */
    function normalizeLineBreakCount(rawCount) {
        if (rawCount === undefined || rawCount === null || rawCount === '') {
            return DEFAULT_LINE_BREAK_COUNT;
        }

        const parsedCount = parseInt(rawCount, 10);
        if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
            return DEFAULT_LINE_BREAK_COUNT;
        }

        return Math.min(parsedCount, MAX_LINE_BREAK_COUNT);
    }

    /**
     * 解析 @br 或 @br(n) 指令。
     */
    function parseLineBreakDirective(src) {
        const match = /^@br(?:\((\d+)\))?(?![\w-])/.exec(src);
        if (!match) return null;

        return {
            raw: match[0],
            count: normalizeLineBreakCount(match[1])
        };
    }

    /**
     * 渲染分行 HTML 片段。
     */
    function renderLineBreak(count) {
        return '<br>'.repeat(normalizeLineBreakCount(count));
    }

    /**
     * 建立 marked 擴充：layout/grid/cover/video/iframe/image/br。
     */
    function buildMarkedExtensions() {
        return [
            {
                // @br 或 @br(2)
                name: 'lineBreakInline',
                level: 'inline',
                start(src) {
                    const index = src.indexOf('@br');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const parsed = parseLineBreakDirective(src);
                    if (!parsed) return undefined;

                    return {
                        type: 'lineBreakInline',
                        raw: parsed.raw,
                        count: parsed.count
                    };
                },
                renderer(token) {
                    return renderLineBreak(token.count);
                }
            },
            {
                // :::layout[ratio,ratio] ... :::end-layout
                name: 'layoutBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf(':::layout');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^:::layout(?:\[(.*?)\])?[ \t]*\n([\s\S]*?)\n:::end-layout[ \t]*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    const raw = match[0];
                    const rawRatios = (match[1] || '').trim();
                    const layoutContent = match[2] || '';

                    const slots = layoutContent
                        .split(/^\s*@slot\s*$/gm)
                        .map((slot) => slot.trim())
                        .filter(Boolean);

                    if (slots.length === 0) {
                        return {
                            type: 'layoutBlock',
                            raw,
                            ratios: [100],
                            slotTokens: [this.lexer.blockTokens('', [])]
                        };
                    }

                    const normalizedRatios = parseLayoutRatios(rawRatios, slots.length);
                    const slotTokens = slots.map((slotMarkdown) =>
                        this.lexer.blockTokens(slotMarkdown, [])
                    );

                    log('layoutBlock:', { slots: slots.length, ratios: normalizedRatios });

                    return {
                        type: 'layoutBlock',
                        raw,
                        ratios: normalizedRatios,
                        slotTokens
                    };
                },
                renderer(token) {
                    const template = toGridColumnsTemplate(token.ratios);
                    const slotHtml = token.slotTokens
                        .map((slotTokenList) => `<div class="media-slot">\n${this.parser.parse(slotTokenList)}\n</div>`)
                        .join('\n');

                    return `<div class="media-layout" style="--media-columns:${template};">\n${slotHtml}\n</div>`;
                }
            },
            {
                // :::grid ... :::
                name: 'gridBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf(':::grid');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^:::grid[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    const raw = match[0];
                    const gridContent = match[1] || '';

                    return {
                        type: 'gridBlock',
                        raw,
                        tokens: this.lexer.blockTokens(gridContent, [])
                    };
                },
                renderer(token) {
                    return `<div class="image-grid">\n${this.parser.parse(token.tokens)}\n</div>`;
                }
            },
            {
                // @cover(url)
                name: 'coverBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf('@cover');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^@cover\s*\((.*)\)\s*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    return {
                        type: 'coverBlock',
                        raw: match[0],
                        url: match[1].trim()
                    };
                },
                renderer(token) {
                    return renderCover(token.url);
                }
            },
            {
                // @video[title](url)
                name: 'videoBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf('@video');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const parsed = parseMediaDirective(src, 'video');
                    if (!parsed) return undefined;

                    return {
                        type: 'videoBlock',
                        raw: parsed.raw,
                        title: parsed.title,
                        url: parsed.url
                    };
                },
                renderer(token) {
                    return renderVideo(token.url, token.title);
                }
            },
            {
                // @iframe[title](url)
                name: 'iframeBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf('@iframe');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const parsed = parseMediaDirective(src, 'iframe');
                    if (!parsed) return undefined;

                    return {
                        type: 'iframeBlock',
                        raw: parsed.raw,
                        title: parsed.title,
                        url: parsed.url
                    };
                },
                renderer(token) {
                    return renderIframe(token.url, token.title);
                }
            },
            {
                // ![alt](url)
                name: 'imageBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf('![');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^[ \t]{0,3}!\[([^\]]*)\]\((.*)\)\s*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    return {
                        type: 'imageBlock',
                        raw: match[0],
                        altText: match[1],
                        url: match[2].trim()
                    };
                },
                renderer(token) {
                    return renderImage(token.url, token.altText);
                }
            }
        ];
    }

    /**
     * 僅初始化一次 marked extension 設定。
     */
    function ensureMarkedConfigured() {
        if (markedConfigured) return true;

        if (!window.marked || typeof window.marked.use !== 'function' || typeof window.marked.parse !== 'function') {
            return false;
        }

        window.marked.use({
            extensions: buildMarkedExtensions()
        });

        markedConfigured = true;
        return true;
    }

    /**
     * 依容器寬度與圖片比例計算 justified 目標寬度。
     */
    function calculateJustifiedWidths(grid, images) {
        const containerWidth = grid.clientWidth;
        const gap = getCSSVariable('--grid-gap', config.gridGap);
        const targetHeight = getCSSVariable('--grid-height', config.gridHeight);

        const imageWidths = images.map((img) => targetHeight * getSafeAspectRatio(img));

        const totalImageWidth = imageWidths.reduce((sum, width) => sum + width, 0);
        const totalGapWidth = (images.length - 1) * gap;
        const availableWidth = containerWidth - totalGapWidth;

        if (!Number.isFinite(totalImageWidth) || !Number.isFinite(availableWidth) ||
            totalImageWidth <= 0 || availableWidth <= 0) {
            resetImageStyles(images);
            return;
        }

        const scale = availableWidth / totalImageWidth;
        if (!Number.isFinite(scale) || scale <= 0) {
            resetImageStyles(images);
            return;
        }

        images.forEach((img, index) => {
            const width = Math.floor(imageWidths[index] * scale);
            const gridItem = getGridItemElement(img);

            gridItem.style.width = `${width}px`;
            gridItem.style.flexGrow = '0';
            gridItem.style.flexShrink = '0';

            if (gridItem !== img) {
                img.style.width = '100%';
            } else {
                img.style.width = `${width}px`;
            }

            img.style.flexGrow = '0';
            img.style.flexShrink = '0';
            img.setAttribute('data-justified', 'true');
        });

        log('calculateJustifiedWidths:', {
            containerWidth,
            images: images.length,
            scale: scale.toFixed(2)
        });
    }

    return {
        /**
         * 擴充模組版本。
         */
        get version() {
            return VERSION;
        },

        /**
         * 更新模組設定值。
         */
        configure(options = {}) {
            config = { ...config, ...options };
            log('configure:', config);
        },

        /**
         * 解析 Markdown 並套用自訂語法。
         */
        render(markdown) {
            if (!markdown) return '';

            if (!ensureMarkedConfigured()) {
                return window.marked && typeof window.marked.parse === 'function'
                    ? window.marked.parse(markdown)
                    : markdown;
            }

            return window.marked.parse(markdown);
        },

        /**
         * render 的別名，保留語意一致性。
         */
        parse(markdown) {
            return this.render(markdown);
        },

        /**
         * 對所有 .image-grid 重新套用 justify 計算。
         */
        justifyImages() {
            const grids = document.querySelectorAll('.image-grid');

            grids.forEach((grid) => {
                const images = Array.from(grid.querySelectorAll('img'));
                if (images.length === 0) return;

                Promise.all(images.map(waitForImageLoad)).then(() => {
                    if (isMobileViewport()) {
                        resetImageStyles(images);
                        return;
                    }

                    calculateJustifiedWidths(grid, images);
                });
            });
        },

        /**
         * 回傳目前支援的自訂語法說明。
         */
        getSupportedSyntax() {
            return [
                { syntax: '@cover(url)', description: '扉頁封面圖' },
                { syntax: ':::grid ... :::', description: '圖片並排網格' },
                { syntax: ':::layout[40,60] ... :::end-layout', description: '多欄混合排版（文字/圖片/影片）' },
                { syntax: '![title](url)', description: '圖片（title 顯示於下方）' },
                { syntax: '@video[title](url)', description: '影片播放器（可選標題）' },
                { syntax: '@iframe[title](url)', description: '嵌入外部網站（可選標題）' },
                { syntax: '@br / @br(2)', description: '段落內分行（支援一次多行）' }
            ];
        }
    };
})();

window.MarkdownExtensions = MarkdownExtensions;
