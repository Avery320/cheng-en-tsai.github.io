/**
 * Markdown Extensions
 * 統一管理自訂 Markdown 語法與圖片網格排版。
 */

const MarkdownExtensions = (function () {
    'use strict';

    const DEFAULT_LINE_BREAK_COUNT = 1;
    const MAX_LINE_BREAK_COUNT = 6;
    const DEFAULT_VIDEO_MUTED = true;
    const DEFAULT_VIDEO_PRELOAD = 'auto';
    const DEFAULT_GIF_PRELOAD = 'auto';
    const optionsApi = window.MarkdownOptions;
    const justifyApi = window.MarkdownJustify;
    const DEFAULT_MEDIA_OPTIONS = optionsApi?.DEFAULT_MEDIA_OPTIONS || { border: false, radius: true };
    const DEFAULT_GALLERY_OPTIONS = optionsApi?.DEFAULT_GALLERY_OPTIONS || { height: '360px', border: false, radius: true };
    const parseMediaOptions = optionsApi?.parseMediaOptions || (() => ({ ...DEFAULT_MEDIA_OPTIONS }));
    const parseGalleryOptions = optionsApi?.parseGalleryOptions || (() => ({ ...DEFAULT_GALLERY_OPTIONS }));
    const getMediaOptionClasses = optionsApi?.getMediaOptionClasses
        || ((options = DEFAULT_MEDIA_OPTIONS) => [options?.border ? 'media-with-border' : '', options?.radius ? 'media-radius-on' : ''].filter(Boolean));

    let markedConfigured = false;

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
     * 將屬性物件轉為 HTML attribute 字串。
     * `true` 會輸出布林屬性；`false/null/undefined` 會被忽略。
     */
    function toHtmlAttributes(attributes = {}) {
        return Object.entries(attributes)
            .filter(([, value]) => value !== false && value !== null && value !== undefined && value !== '')
            .map(([name, value]) => {
                if (value === true) return name;
                return `${name}="${escapeHtml(String(value))}"`;
            })
            .join(' ');
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

    const VIDEO_IFRAME_HOST_PATTERN = /^(?:m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be|(?:player\.)?vimeo\.com|(?:player\.)?dailymotion\.com|(?:player\.)?twitch\.tv)$/i;
    const IFRAME_FULLSCREEN_BUTTON_HTML = '<button type="button" class="iframe-fullscreen-button ui-overlay-icon-button" data-iframe-action="fullscreen" title="Fullscreen" aria-label="Show embedded content in fullscreen"><svg class="ui-overlay-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm0-4h2V7h3V5H5v5zm10 7h-3v2h5v-5h-2v3zm0-12v3h2V5h-5v2h3z"></path></svg></button>';

    /**
     * 判斷 iframe URL 是否為影片平台嵌入。
     */
    function isVideoIframeUrl(rawUrl = '') {
        const normalized = String(rawUrl || '').trim();
        if (!normalized) return false;
        if (detectVideoMimeType(normalized)) return true;

        try {
            const host = new URL(normalized, window.location.href).hostname.replace(/^www\./i, '');
            return VIDEO_IFRAME_HOST_PATTERN.test(host);
        } catch (_error) {
            return false;
        }
    }

    /**
     * 依檔名副檔名推斷影片 MIME 類型；未知時回傳空字串。
     */
    function detectVideoMimeType(rawUrl = '') {
        const normalized = String(rawUrl || '').trim();
        if (!normalized) return '';

        let pathname = normalized;
        try {
            pathname = new URL(normalized, window.location.href).pathname;
        } catch (_error) {
            // 非標準 URL 時退回原字串處理。
        }

        const extensionMatch = /\.([a-z0-9]+)$/i.exec(pathname);
        const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

        const mimeTypeByExtension = {
            mp4: 'video/mp4',
            m4v: 'video/mp4',
            webm: 'video/webm',
            ogg: 'video/ogg',
            ogv: 'video/ogg',
            mov: 'video/quicktime'
        };

        return mimeTypeByExtension[extension] || '';
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
    function renderImage(url, altText, options = DEFAULT_MEDIA_OPTIONS) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanAlt = String(altText || '').trim();
        const safeAlt = escapeHtml(cleanAlt);
        const imageHtml = `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;

        return renderFigure(imageHtml, cleanAlt, ['media-image-figure', ...getMediaOptionClasses(options)]);
    }

    /**
     * 渲染影片播放器區塊。
     */
    function renderVideoMedia(url, title, mode = 'video', options = DEFAULT_MEDIA_OPTIONS) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const videoMimeType = detectVideoMimeType(url);
        const isGifMode = mode === 'gif';
        const videoAttributes = toHtmlAttributes({
            controls: isGifMode ? false : true,
            autoplay: isGifMode,
            loop: isGifMode,
            muted: isGifMode ? true : DEFAULT_VIDEO_MUTED,
            preload: isGifMode ? DEFAULT_GIF_PRELOAD : DEFAULT_VIDEO_PRELOAD,
            playsinline: true,
            class: isGifMode ? 'project-video project-gif' : 'project-video',
            title: cleanTitle || null
        });
        const sourceTypeAttribute = videoMimeType ? ` type="${videoMimeType}"` : '';
        const videoHtml = `<video ${videoAttributes}><source src="${safeUrl}"${sourceTypeAttribute}></video>`;

        return renderFigure(videoHtml, cleanTitle, getMediaOptionClasses(options));
    }

    /**
     * 渲染影片播放器區塊。
     */
    function renderVideo(url, title, options = DEFAULT_MEDIA_OPTIONS) {
        return renderVideoMedia(url, title, 'video', options);
    }

    /**
     * 渲染 GIF-like 影片區塊（自動播放、循環、靜音）。
     */
    function renderGif(url, title, options = DEFAULT_MEDIA_OPTIONS) {
        return renderVideoMedia(url, title, 'gif', options);
    }

    /**
     * 渲染 iframe 嵌入區塊。
     */
    function renderIframe(url, title, options = DEFAULT_MEDIA_OPTIONS) {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) return '';

        const cleanTitle = String(title || '').trim();
        const safeTitle = escapeHtml(cleanTitle || 'Embedded content');
        const iframeHtml = `<div class="iframe-container">${isVideoIframeUrl(url) ? '' : IFRAME_FULLSCREEN_BUTTON_HTML}<iframe src="${safeUrl}" loading="lazy" title="${safeTitle}" allow="fullscreen; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;

        return renderFigure(iframeHtml, cleanTitle, getMediaOptionClasses(options));
    }

    /**
     * 解析 gallery 區塊內的圖片語法。
     */
    function parseGalleryImages(markdown = '') {
        const images = [];
        const imagePattern = /^[ \t]{0,3}!\[([^\]]*)\]\((.*?)\)\s*$/gm;
        let match;
        while ((match = imagePattern.exec(markdown)) !== null) {
            const title = String(match[1] || '').trim();
            const url = String(match[2] || '').trim();
            if (!url) continue;
            images.push({ title, url });
        }
        return images;
    }

    /**
     * 渲染 gallery 容器（由 widgets 層接手互動初始化）。
     */
    function renderGallery(images = [], options = DEFAULT_GALLERY_OPTIONS) {
        if (!Array.isArray(images) || images.length === 0) return '';

        const mainSlides = [];
        const thumbSlides = [];

        images.forEach((image, index) => {
            const cleanTitle = String(image?.title || '').trim();
            const safeTitle = escapeHtml(cleanTitle);
            const safeUrl = sanitizeUrl(image?.url || '');
            if (!safeUrl) return;

            const zoomAttributes = toHtmlAttributes({
                type: 'button',
                class: 'gallery-zoom-trigger',
                'data-gallery-zoom-src': safeUrl,
                'aria-label': cleanTitle ? `View ${cleanTitle}` : `View image ${index + 1}`
            });

            mainSlides.push(
                `<li class="splide__slide"><button ${zoomAttributes}><img src="${safeUrl}" alt="${safeTitle}" loading="lazy"></button></li>`
            );
            thumbSlides.push(
                `<li class="splide__slide"><img src="${safeUrl}" alt="${safeTitle}" loading="lazy"></li>`
            );
        });

        if (mainSlides.length === 0) return '';

        const styleValue = `--gallery-height:${options.height};`;
        const wrapperAttributes = toHtmlAttributes({
            class: ['media-gallery', 'media-figure', ...getMediaOptionClasses(options)].join(' ').trim(),
            'data-widget': 'gallery',
            style: styleValue
        });

        // Splide structure reference:
        // https://splidejs.com/guides/structure/
        return `<section ${wrapperAttributes}>
<div class="splide media-gallery-main" data-gallery-role="main" aria-label="Image gallery">
<div class="splide__track">
<ul class="splide__list">
${mainSlides.join('\n')}
</ul>
</div>
</div>
<div class="splide media-gallery-thumbs" data-gallery-role="thumbs" aria-label="Gallery thumbnails">
<div class="splide__track">
<ul class="splide__list">
${thumbSlides.join('\n')}
</ul>
</div>
</div>
</section>`;
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
     * 建立 @video/@gif/@iframe 共用 block 擴充，避免重複 tokenizer/renderer。
     */
    function createMediaBlockExtension(directiveName, tokenType, renderer) {
        const directivePattern = new RegExp(`^@${directiveName}\\s*\\[([^\\]]*)\\]\\s*\\((.*?)\\)\\s*(?:\\{([^\\n}]*)\\})?\\s*(?:\\n|$)`);
        return {
            name: tokenType,
            level: 'block',
            start(src) {
                const index = src.indexOf(`@${directiveName}`);
                return index >= 0 ? index : undefined;
            },
            tokenizer(src) {
                const match = directivePattern.exec(src);
                if (!match) return undefined;
                return {
                    type: tokenType,
                    raw: match[0],
                    title: match[1].trim(),
                    url: match[2].trim(),
                    options: parseMediaOptions(match[3] || '')
                };
            },
            renderer(token) {
                return renderer(token.url, token.title, token.options);
            }
        };
    }

    /**
     * 建立 marked 擴充：gallery/layout/grid/cover/video/gif/iframe/image/br。
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
                // :::gallery{height=...} ... :::
                name: 'galleryBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf(':::gallery');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^:::gallery(?:\{([^}\n]*)\})?[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    const images = parseGalleryImages(match[2] || '');
                    if (images.length === 0) return undefined;

                    return {
                        type: 'galleryBlock',
                        raw: match[0],
                        options: parseGalleryOptions(match[1] || ''),
                        images
                    };
                },
                renderer(token) {
                    return renderGallery(token.images, token.options);
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
            createMediaBlockExtension('video', 'videoBlock', renderVideo),
            createMediaBlockExtension('gif', 'gifBlock', renderGif),
            createMediaBlockExtension('iframe', 'iframeBlock', renderIframe),
            {
                // ![alt](url)
                name: 'imageBlock',
                level: 'block',
                start(src) {
                    const index = src.indexOf('![');
                    return index >= 0 ? index : undefined;
                },
                tokenizer(src) {
                    const match = /^[ \t]{0,3}!\[([^\]]*)\]\((.*?)\)\s*(?:\{([^}\n]*)\})?\s*(?:\n|$)/.exec(src);
                    if (!match) return undefined;

                    return {
                        type: 'imageBlock',
                        raw: match[0],
                        altText: match[1],
                        url: match[2].trim(),
                        options: parseMediaOptions(match[3] || '')
                    };
                },
                renderer(token) {
                    return renderImage(token.url, token.altText, token.options);
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

    return {
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
         * 對所有 .image-grid 重新套用 justify 計算。
         */
        justifyImages() {
            if (!justifyApi || typeof justifyApi.justifyImages !== 'function') {
                return;
            }

            justifyApi.justifyImages({
                selector: '.image-grid'
            });
        }
    };
})();

window.MarkdownExtensions = MarkdownExtensions;
