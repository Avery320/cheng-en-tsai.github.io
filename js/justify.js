(function () {
    'use strict';

    const DEFAULTS = Object.freeze({
        selector: '.image-grid',
        gridHeight: 280,
        mobileBreakpoint: 768
    });
    const DEFAULT_ASPECT_RATIO = 16 / 9;
    const MIN_ASPECT_RATIO = 0.2;
    const MAX_ASPECT_RATIO = 6;

    const cssVar = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
    const isMobileViewport = (breakpoint = DEFAULTS.mobileBreakpoint) => window.matchMedia(`(max-width: ${breakpoint}px)`).matches;

    function getGridItemElement(image) {
        const figure = image.closest('.media-image-figure');
        return figure && figure.closest('.image-grid') ? figure : image;
    }

    function clearSizing(element) {
        element.style.removeProperty('flex');
        element.style.removeProperty('flex-basis');
        element.style.removeProperty('width');
        element.style.removeProperty('flex-grow');
        element.style.removeProperty('flex-shrink');
    }

    function resetImageStyles(images) {
        images.forEach((img) => {
            clearSizing(getGridItemElement(img));
            clearSizing(img);
            img.style.removeProperty('height');
            img.style.removeProperty('object-fit');
            img.setAttribute('data-justified', 'true');
        });
    }

    function getSafeAspectRatio(image) {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return DEFAULT_ASPECT_RATIO;
        const ratio = width / height;
        if (!Number.isFinite(ratio) || ratio <= 0) return DEFAULT_ASPECT_RATIO;
        return Math.min(Math.max(ratio, MIN_ASPECT_RATIO), MAX_ASPECT_RATIO);
    }

    function waitForImageLoad(image) {
        if (image.complete) return Promise.resolve(image);

        return new Promise((resolve) => {
            const done = () => {
                image.removeEventListener('load', done);
                image.removeEventListener('error', done);
                resolve(image);
            };
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
        });
    }

    function isImageReady(image) {
        return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
    }

    function applyFlexSizing(item, image, ratio, targetHeight) {
        item.style.flex = `${ratio} 1 0`;
        item.style.width = '0';

        image.style.width = item === image ? '0' : '100%';
        image.style.height = `${targetHeight}px`;
        image.style.objectFit = 'cover';
        image.setAttribute('data-justified', 'true');
    }

    function calculateJustifiedWidths(grid, images, options = {}) {
        const gridHeight = options.gridHeight ?? DEFAULTS.gridHeight;
        const targetHeight = cssVar('--grid-height', gridHeight);
        if (!Number.isFinite(targetHeight) || targetHeight <= 0) {
            resetImageStyles(images);
            return;
        }

        for (let i = 0; i < images.length; i += 1) {
            const img = images[i];
            const ratio = getSafeAspectRatio(img);
            const item = getGridItemElement(img);
            applyFlexSizing(item, img, ratio, targetHeight);
        }
    }

    function justifyImages(options = {}) {
        const selector = options.selector ?? DEFAULTS.selector;
        const mobileBreakpoint = options.mobileBreakpoint ?? DEFAULTS.mobileBreakpoint;
        const isMobile = isMobileViewport(mobileBreakpoint);

        document.querySelectorAll(selector).forEach((grid) => {
            const images = Array.from(grid.querySelectorAll('img'));
            if (!images.length) return;

            if (isMobile) {
                resetImageStyles(images);
                return;
            }

            const relayout = () => {
                if (isMobileViewport(mobileBreakpoint)) {
                    resetImageStyles(images);
                    return;
                }
                calculateJustifiedWidths(grid, images, options);
            };

            // 先排一次，未載入圖片會先用安全比例。
            relayout();

            images
                .filter((img) => !isImageReady(img))
                .forEach((img) => {
                    waitForImageLoad(img).then(relayout);
                });
        });
    }

    window.MarkdownJustify = Object.freeze({ justifyImages });
})();
