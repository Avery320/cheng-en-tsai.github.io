(function () {
    'use strict';

    const DEFAULTS = Object.freeze({
        selector: '.image-grid'
    });
    const DEFAULT_ASPECT_RATIO = 16 / 9;
    const MIN_ASPECT_RATIO = 0.2;
    const MAX_ASPECT_RATIO = 6;
    const DEFAULT_GAP = 8;
    const DEFAULT_MEDIA_ARRANGEMENT_BREAKPOINT = 768;

    const cssVar = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
    const isMediaArrangementMobileViewport = (breakpoint = DEFAULT_MEDIA_ARRANGEMENT_BREAKPOINT) => window.matchMedia(`(max-width: ${breakpoint}px)`).matches;

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

    function getGridGap(grid) {
        const styles = getComputedStyle(grid);
        const parsedGap = parseFloat(styles.columnGap || styles.gap);
        if (Number.isFinite(parsedGap) && parsedGap >= 0) return parsedGap;
        return cssVar('--grid-gap', DEFAULT_GAP);
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

    function applyFixedSizing(item, image, width, height) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return;

        if (item === image) {
            image.style.flex = `0 0 ${width}px`;
            image.style.width = `${width}px`;
        } else {
            item.style.flex = `0 0 ${width}px`;
            item.style.width = `${width}px`;
            image.style.width = '100%';
        }

        image.style.height = `${height}px`;
        image.style.objectFit = 'contain';
        image.setAttribute('data-justified', 'true');
    }

    function calculateJustifiedWidths(grid, images) {
        const gap = getGridGap(grid);
        const totalGap = Math.max(0, images.length - 1) * gap;
        const availableWidth = grid.clientWidth - totalGap;
        if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
            resetImageStyles(images);
            return;
        }

        const ratios = images.map((image) => getSafeAspectRatio(image));
        const ratioTotal = ratios.reduce((sum, ratio) => sum + ratio, 0);
        if (!Number.isFinite(ratioTotal) || ratioTotal <= 0) {
            resetImageStyles(images);
            return;
        }

        const rowHeight = availableWidth / ratioTotal;
        if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
            resetImageStyles(images);
            return;
        }

        for (let i = 0; i < images.length; i += 1) {
            const image = images[i];
            const item = getGridItemElement(image);
            const width = ratios[i] * rowHeight;
            applyFixedSizing(item, image, width, rowHeight);
        }
    }

    function justifyImages(options = {}) {
        const selector = options.selector ?? DEFAULTS.selector;
        const mediaArrangementBreakpoint = options.mediaArrangementBreakpoint
            ?? options.mobileBreakpoint
            ?? DEFAULT_MEDIA_ARRANGEMENT_BREAKPOINT;

        document.querySelectorAll(selector).forEach((grid) => {
            const images = Array.from(grid.querySelectorAll('img'));
            if (!images.length) return;

            const relayout = () => {
                if (isMediaArrangementMobileViewport(mediaArrangementBreakpoint)) {
                    resetImageStyles(images);
                    return;
                }

                calculateJustifiedWidths(grid, images);
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
