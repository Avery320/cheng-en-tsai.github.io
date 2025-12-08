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
     * 解析 iframe 語法
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseIframe(markdown) {
        return markdown.replace(/@iframe\[(.*?)\]/g, (match, url) => {
            log('parseIframe:', url);
            return `<div class="iframe-container"><iframe src="${url}" loading="lazy"></iframe></div>`;
        });
    }

    /**
     * 解析影片語法
     * @private
     * @param {string} markdown
     * @returns {string}
     */
    function parseVideo(markdown) {
        return markdown.replace(/@video\[(.*?)\]/g, (match, url) => {
            log('parseVideo:', url);
            return `<video controls class="project-video"><source src="${url}" type="video/mp4"></video>`;
        });
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
        const imageWidths = images.map(img => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            return targetHeight * aspectRatio;
        });

        // 計算總寬度與縮放比例
        const totalImageWidth = imageWidths.reduce((sum, w) => sum + w, 0);
        const totalGapWidth = (images.length - 1) * gap;
        const availableWidth = containerWidth - totalGapWidth;
        const scale = availableWidth / totalImageWidth;

        // 設定每張圖片的寬度
        images.forEach((img, index) => {
            const width = Math.floor(imageWidths[index] * scale);
            img.style.width = `${width}px`;
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
                { syntax: ':::grid ... :::', description: '圖片並排網格' },
                { syntax: '@video[url]', description: '影片播放器' },
                { syntax: '@iframe[url]', description: '嵌入外部網站' }
            ];
        }
    };
})();

// 掛載到全域
window.MarkdownExtensions = MarkdownExtensions;
