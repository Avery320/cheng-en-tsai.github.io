/**
 * Markdown Extensions
 * 自訂 Markdown 語法擴充模組
 * 
 * @version 1.0.0
 * @author Portfolio Project
 * @description 提供 Markdown 自訂語法解析與 Justified Image Gallery 功能
 * 
 * @example
 * // 解析自訂語法
 * const html = MarkdownExtensions.parse(markdownContent);
 * 
 * // 計算圖片排版
 * MarkdownExtensions.justifyImages();
 * 
 * // 自訂設定
 * MarkdownExtensions.configure({ gridHeight: 300 });
 */

const MarkdownExtensions = (function () {
    'use strict';

    // ===== 私有變數 =====
    const VERSION = '1.0.0';
    const MOBILE_BREAKPOINT = 768;
    const DEFAULT_ASPECT_RATIO = 16 / 9;
    const MIN_ASPECT_RATIO = 0.2;
    const MAX_ASPECT_RATIO = 6;

    // 預設設定
    let config = {
        gridHeight: 280,
        gridGap: 8,
        debug: false
    };

    // ===== 私有方法 =====

    /**
     * 記錄 debug 訊息
     * @private
     */
    function log(...args) {
        if (config.debug) {
            console.log('[MarkdownExtensions]', ...args);
        }
    }

    /**
     * 從 CSS 變數讀取設定值
     * @private
     */
    function getCSSVariable(name, fallback) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(name);
        return parseInt(value) || fallback;
    }

    /**
     * 是否為小螢幕
     * @private
     * @returns {boolean}
     */
    function isMobileViewport() {
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    }

    /**
     * 清除圖片寬度設定，交給 CSS 響應式控制
     * @private
     * @param {HTMLImageElement[]} images
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
     * 取得網格排版單位（圖片本身或其外層 caption 容器）
     * @private
     * @param {HTMLImageElement} image
     * @returns {HTMLElement}
     */
    function getGridItemElement(image) {
        return image.closest('.grid-media-item') || image;
    }

    /**
     * 取得可用的圖片寬高比，避免 NaN / Infinity 導致計算失敗
     * @private
     * @param {HTMLImageElement} image
     * @returns {number}
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

    // ===== 解析器 =====

    /**
     * 解析圖片網格語法
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseGrid(markdown) {
        return markdown.replace(/:::grid([\s\S]*?):::/g, (match, content) => {
            log('parseGrid:', content.trim().substring(0, 50) + '...');
            const cleanContent = content.trim();
            return `<div class="image-grid">\n\n${cleanContent}\n\n</div>`;
        });
    }

    /**
     * 解析封面語法
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseCover(markdown) {
        return markdown.replace(/@cover\[(.*?)\]/g, (match, url) => {
            log('parseCover:', url);
            return `<div class="notion-cover"><img src="${url}" alt="Cover"></div>`;
        });
    }

    /**
     * 轉義 HTML 文字，避免插入危險字元
     * @private
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text = '') {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * 依標題文字建立 caption
     * @private
     * @param {string} rawTitle
     * @returns {string}
     */
    function renderCaption(rawTitle = '') {
        const title = rawTitle.trim();
        if (!title) return '';
        return `<figcaption class="media-caption">${escapeHtml(title)}</figcaption>`;
    }

    /**
     * 依需求包裝媒體 caption
     * @private
     * @param {string} mediaHtml
     * @param {string} title
     * @returns {string}
     */
    function renderMediaWithOptionalCaption(mediaHtml, title) {
        const captionHtml = renderCaption(title);
        if (!captionHtml) return mediaHtml;
        return `<figure class="media-figure">\n${mediaHtml}\n${captionHtml}\n</figure>`;
    }

    /**
     * 解析 iframe 語法
     * 語法：@iframe[title](url)
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseIframe(markdown) {
        return markdown.replace(/@iframe\s*\[(.*?)\]\s*\((.*?)\)/g, (match, title, url) => {
            const cleanTitle = title.trim();
            const cleanUrl = url.trim();

            log('parseIframe:', { title: cleanTitle, url: cleanUrl });
            if (!cleanUrl) return '';

            const safeUrl = escapeHtml(cleanUrl);
            const safeTitle = escapeHtml(cleanTitle || 'Embedded content');
            const iframeHtml = `<div class="iframe-container"><iframe src="${safeUrl}" loading="lazy" title="${safeTitle}"></iframe></div>`;
            return renderMediaWithOptionalCaption(iframeHtml, cleanTitle);
        });
    }

    /**
     * 解析影片語法
     * 語法：@video[title](url)
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseVideo(markdown) {
        return markdown.replace(/@video\s*\[(.*?)\]\s*\((.*?)\)/g, (match, title, url) => {
            const cleanTitle = title.trim();
            const cleanUrl = url.trim();

            log('parseVideo:', { title: cleanTitle, url: cleanUrl });
            if (!cleanUrl) return '';

            const safeUrl = escapeHtml(cleanUrl);
            const safeTitle = escapeHtml(cleanTitle);
            const titleAttribute = cleanTitle ? ` title="${safeTitle}"` : '';
            const videoHtml = `<video controls class="project-video"${titleAttribute}><source src="${safeUrl}" type="video/mp4"></video>`;
            return renderMediaWithOptionalCaption(videoHtml, cleanTitle);
        });
    }

    /**
     * 取得平均欄寬百分比
     * @private
     * @param {number} count
     * @returns {number[]}
     */
    function getEvenRatios(count) {
        if (count <= 0) return [];
        const evenRatio = 100 / count;
        return Array.from({ length: count }, () => evenRatio);
    }

    /**
     * 解析欄寬百分比設定並標準化為 100%
     * @private
     * @param {string} rawRatios
     * @param {number} slotCount
     * @returns {number[]}
     */
    function parseLayoutRatios(rawRatios, slotCount) {
        const fallbackRatios = getEvenRatios(slotCount);
        if (!rawRatios) return fallbackRatios;

        const ratioValues = rawRatios
            .split(/[^0-9.]+/g)
            .map(value => parseFloat(value))
            .filter(value => Number.isFinite(value) && value > 0);

        if (ratioValues.length !== slotCount) return fallbackRatios;

        const ratioTotal = ratioValues.reduce((sum, value) => sum + value, 0);
        if (ratioTotal <= 0) return fallbackRatios;

        return ratioValues.map((value) =>
            Number(((value / ratioTotal) * 100).toFixed(4))
        );
    }

    /**
     * 依比例轉換為 grid-template-columns 字串
     * @private
     * @param {number[]} ratios
     * @returns {string}
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
     * 轉換 layout 內單一欄位內容
     * @private
     * @param {string} slotMarkdown
     * @returns {string}
     */
    function renderLayoutSlot(slotMarkdown) {
        const cleanSlotMarkdown = slotMarkdown.trim();
        if (!cleanSlotMarkdown) return '';

        let processed = cleanSlotMarkdown;
        processed = parseGrid(processed);
        processed = parseIframe(processed);
        processed = parseVideo(processed);

        if (window.marked && typeof marked.parse === 'function') {
            return marked.parse(processed);
        }

        return processed;
    }

    /**
     * 解析多欄混合排版語法
     * 語法：
     * :::layout[40,60]
     * @slot
     * 左欄內容
     * @slot
     * 右欄內容
     * :::end-layout
     *
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseLayout(markdown) {
        return markdown.replace(
            /:::layout(?:\[(.*?)\])?\s*([\s\S]*?):::end-layout/g,
            (match, rawRatios = '', content = '') => {
                const slotContents = content
                    .split(/^\s*@slot\s*$/gm)
                    .map(slot => slot.trim())
                    .filter(Boolean);

                if (slotContents.length === 0) return '';

                const normalizedRatios = parseLayoutRatios(rawRatios, slotContents.length);
                const gridColumnsTemplate = toGridColumnsTemplate(normalizedRatios);

                const slotHtml = slotContents
                    .map((slotContent) => {
                        const renderedSlot = renderLayoutSlot(slotContent);
                        return `<div class="media-slot">\n${renderedSlot}\n</div>`;
                    })
                    .join('\n');

                log('parseLayout:', {
                    slots: slotContents.length,
                    ratios: normalizedRatios
                });

                return `<div class="media-layout" style="--media-columns:${gridColumnsTemplate};">\n${slotHtml}\n</div>`;
            }
        );
    }

    // ===== Justified Gallery =====

    /**
     * 計算單一網格的圖片寬度
     * @private
     * @param {HTMLElement} grid
     * @param {HTMLImageElement[]} images
     */
    function calculateJustifiedWidths(grid, images) {
        const containerWidth = grid.clientWidth;
        const gap = getCSSVariable('--grid-gap', config.gridGap);
        const targetHeight = getCSSVariable('--grid-height', config.gridHeight);

        // 計算每張圖片在目標高度下的寬度
        const imageWidths = images.map((img) => targetHeight * getSafeAspectRatio(img));

        // 計算總寬度與縮放比例
        const totalImageWidth = imageWidths.reduce((sum, w) => sum + w, 0);
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

        // 設定每張圖片的寬度
        images.forEach((img, index) => {
            const width = Math.floor(imageWidths[index] * scale);
            const gridItem = getGridItemElement(img);

            gridItem.style.width = `${width}px`;
            gridItem.style.flexGrow = '0';
            gridItem.style.flexShrink = '0';

            if (gridItem !== img) {
                img.style.width = '100%';
                img.style.flexGrow = '0';
                img.style.flexShrink = '0';
            } else {
                img.style.width = `${width}px`;
                img.style.flexGrow = '0';
                img.style.flexShrink = '0';
            }

            img.setAttribute('data-justified', 'true');
        });

        log('calculateJustifiedWidths:', {
            containerWidth,
            images: images.length,
            scale: scale.toFixed(2)
        });
    }

    // ===== 公開 API =====

    return {
        /**
         * 取得版本號
         * @returns {string}
         */
        get version() {
            return VERSION;
        },

        /**
         * 設定模組參數
         * @param {Object} options
         * @param {number} [options.gridHeight=280] - 圖片網格高度
         * @param {number} [options.gridGap=8] - 圖片間距
         * @param {boolean} [options.debug=false] - 是否顯示 debug 訊息
         */
        configure(options) {
            config = { ...config, ...options };
            log('configure:', config);
        },

        /**
         * 解析所有自訂語法
         * @param {string} markdown - 原始 Markdown 內容
         * @returns {string} - 轉換後的內容
         */
        parse(markdown) {
            if (!markdown) return '';

            let processed = markdown;
            processed = parseCover(processed);
            processed = parseLayout(processed);
            processed = parseGrid(processed);
            processed = parseIframe(processed);
            processed = parseVideo(processed);

            return processed;
        },

        /**
         * 計算頁面上所有圖片網格的寬度分配
         * @returns {Promise<void>}
         */
        justifyImages() {
            const grids = document.querySelectorAll('.image-grid');

            grids.forEach(grid => {
                const images = Array.from(grid.querySelectorAll('img'));
                if (images.length === 0) return;

                // 等待所有圖片載入完成
                const imageLoadPromises = images.map(img => {
                    return new Promise((resolve) => {
                        if (img.complete && img.naturalWidth > 0) {
                            resolve(img);
                        } else {
                            img.onload = () => resolve(img);
                            img.onerror = () => resolve(img);
                        }
                    });
                });

                Promise.all(imageLoadPromises).then(() => {
                    if (isMobileViewport()) {
                        resetImageStyles(images);
                        return;
                    }
                    calculateJustifiedWidths(grid, images);
                });
            });
        },

        /**
         * 取得支援的語法列表
         * @returns {Object[]}
         */
        getSupportedSyntax() {
            return [
                { syntax: '@cover[url]', description: '扉頁封面圖' },
                { syntax: ':::grid ... :::', description: '圖片並排網格' },
                { syntax: ':::layout[40,60] ... :::end-layout', description: '多欄混合排版（文字/圖片/影片）' },
                { syntax: '![title](url)', description: '圖片（title 顯示於下方）' },
                { syntax: '@video[title](url)', description: '影片播放器（可選標題）' },
                { syntax: '@iframe[title](url)', description: '嵌入外部網站（可選標題）' }
            ];
        }
    };
})();

// 掛載到全域
window.MarkdownExtensions = MarkdownExtensions;
