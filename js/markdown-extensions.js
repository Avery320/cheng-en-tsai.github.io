/**
 * Markdown Extensions
 * 統一管理自訂 Markdown 語法與圖片網格排版。
 */

const MarkdownExtensions = (function () {
    'use strict';

    const VERSION = '2.0.0';
    const MOBILE_BREAKPOINT = 768;
    const DEFAULT_ASPECT_RATIO = 16 / 9;
    const MIN_ASPECT_RATIO = 0.2;
    const MAX_ASPECT_RATIO = 6;

    let markedConfigured = false;

    let config = {
        gridHeight: 280,
        gridGap: 8,
        debug: false
    };

    function log(...args) {
        if (config.debug) {
            console.log('[MarkdownExtensions]', ...args);
        }
    }

    function escapeHtml(text = '') {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sanitizeUrl(rawUrl = '') {
        const trimmed = String(rawUrl).trim();
        if (!trimmed) return '';

        const lowered = trimmed.toLowerCase();
        if (lowered.startsWith('javascript:')) return '';

        return escapeHtml(trimmed);
    }

    function getCSSVariable(name, fallback) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(name);
        return parseInt(value, 10) || fallback;
    }

    function isMobileViewport() {
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    }

    function getGridItemElement(image) {
        const mediaFigure = image.closest('.media-image-figure');
        if (mediaFigure && mediaFigure.closest('.image-grid')) {
            return mediaFigure;
        }

        return image;
    }

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

    function renderCaption(rawTitle = '') {
        const title = rawTitle.trim();
        if (!title) return '';
        return `<figcaption class="media-caption">${escapeHtml(title)}</figcaption>`;
    }

    function renderFigure(contentHtml, captionTitle = '', classNames = []) {
        const classes = ['media-figure', ...classNames].join(' ').trim();
        const caption = renderCaption(captionTitle);

        if (caption) {
            return `<figure class="${classes}">\n${contentHtml}\n${caption}\n</figure>`;
        }

        return `<figure class="${classes}">\n${contentHtml}\n</figure>`;
    }

    function renderCover(url) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        return `<div class="notion-cover"><img src="${safeUrl}" alt="Cover" loading="lazy"></div>`;
    }

    function renderImage(url, altText) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanAlt = String(altText || '').trim();
        const safeAlt = escapeHtml(cleanAlt);
        const imageHtml = `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;

        return renderFigure(imageHtml, cleanAlt, ['media-image-figure']);
    }

    function renderVideo(url, title) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const safeTitle = escapeHtml(cleanTitle);
        const titleAttribute = cleanTitle ? ` title="${safeTitle}"` : '';
        const videoHtml = `<video controls class="project-video"${titleAttribute}><source src="${safeUrl}" type="video/mp4"></video>`;

        return renderFigure(videoHtml, cleanTitle);
    }

    function renderIframe(url, title) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const safeTitle = escapeHtml(cleanTitle || 'Embedded content');
        const iframeHtml = `<div class="iframe-container"><iframe src="${safeUrl}" loading="lazy" title="${safeTitle}"></iframe></div>`;

        return renderFigure(iframeHtml, cleanTitle);
    }

    function getEvenRatios(count) {
        if (count <= 0) return [];
        const evenRatio = 100 / count;
        return Array.from({ length: count }, () => evenRatio);
    }

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

    function toGridColumnsTemplate(ratios) {
        if (!Array.isArray(ratios) || ratios.length === 0) {
            return 'minmax(0, 1fr)';
        }

        return ratios
            .map((ratio) => `minmax(0, ${ratio}fr)`)
            .join(' ');
    }

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

    function buildMarkedExtensions() {
        return [
            {
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
        get version() {
            return VERSION;
        },

        configure(options = {}) {
            config = { ...config, ...options };
            log('configure:', config);
        },

        render(markdown) {
            if (!markdown) return '';

            if (!ensureMarkedConfigured()) {
                return window.marked && typeof window.marked.parse === 'function'
                    ? window.marked.parse(markdown)
                    : markdown;
            }

            return window.marked.parse(markdown);
        },

        parse(markdown) {
            return this.render(markdown);
        },

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

        getSupportedSyntax() {
            return [
                { syntax: '@cover(url)', description: '扉頁封面圖' },
                { syntax: ':::grid ... :::', description: '圖片並排網格' },
                { syntax: ':::layout[40,60] ... :::end-layout', description: '多欄混合排版（文字/圖片/影片）' },
                { syntax: '![title](url)', description: '圖片（title 顯示於下方）' },
                { syntax: '@video[title](url)', description: '影片播放器（可選標題）' },
                { syntax: '@iframe[title](url)', description: '嵌入外部網站（可選標題）' }
            ];
        }
    };
})();

window.MarkdownExtensions = MarkdownExtensions;
