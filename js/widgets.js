(function () {
    'use strict';

    const WIDGET_SELECTOR = '[data-widget]';
    const widgetDestroyers = new WeakMap();
    const GALLERY_THUMBS_PER_PAGE = 6;
    const GALLERY_THUMBS_PER_PAGE_MOBILE = 4;

    let lightboxRoot = null;
    let lightboxDialog = null;
    let lightboxImage = null;
    let lastFocusedElement = null;
    let lightboxItems = [];
    let lightboxIndex = 0;
    const NAV_ICON_PATHS = Object.freeze({
        prev: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
        next: 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L12.17 12z'
    });

    function collectWidgetElements(root) {
        if (!root || typeof root.querySelectorAll !== 'function') return [];
        const elements = [];
        if (typeof root.matches === 'function' && root.matches(WIDGET_SELECTOR)) {
            elements.push(root);
        }
        return elements.concat(Array.from(root.querySelectorAll(WIDGET_SELECTOR)));
    }

    function createNavButtonHtml(direction, label) {
        const path = NAV_ICON_PATHS[direction];
        if (!path) return '';
        return `<button type="button" class="gallery-nav-button gallery-nav-button--${direction} ui-overlay-icon-button" data-gallery-nav="${direction}" aria-label="${label}"><svg class="ui-overlay-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="${path}"></path></svg></button>`;
    }

    function getNavDelta(action) {
        return action === 'prev' ? -1 : action === 'next' ? 1 : 0;
    }

    function ensureLightbox() {
        if (lightboxRoot) return;

        lightboxRoot = document.createElement('div');
        lightboxRoot.className = 'gallery-lightbox';
        lightboxRoot.hidden = true;
        lightboxRoot.innerHTML = `
<div class="gallery-lightbox__backdrop" data-gallery-lightbox-close></div>
<div class="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image preview" tabindex="-1">
${createNavButtonHtml('prev', 'Show previous image')}
<img class="gallery-lightbox__image" alt="">
${createNavButtonHtml('next', 'Show next image')}
</div>`;
        document.body.appendChild(lightboxRoot);

        lightboxDialog = lightboxRoot.querySelector('.gallery-lightbox__dialog');
        lightboxImage = lightboxRoot.querySelector('.gallery-lightbox__image');

        lightboxRoot.addEventListener('click', (event) => {
            const navAction = event.target.closest('[data-gallery-nav]')?.getAttribute('data-gallery-nav');
            const delta = getNavDelta(navAction);
            if (delta) {
                event.preventDefault();
                stepLightbox(delta);
                return;
            }
            if (!event.target.closest('[data-gallery-lightbox-close]')) return;
            closeLightbox();
        });

        document.addEventListener('keydown', (event) => {
            if (!lightboxRoot || lightboxRoot.hidden) return;
            if (event.key === 'Escape') {
                closeLightbox();
                return;
            }
            const delta = getNavDelta(
                event.key === 'ArrowLeft' ? 'prev' : event.key === 'ArrowRight' ? 'next' : ''
            );
            if (!delta) return;
            event.preventDefault();
            stepLightbox(delta);
        });
    }

    function normalizeLightboxIndex(nextIndex) {
        const total = lightboxItems.length;
        if (total <= 0) return 0;
        const index = Number.isFinite(nextIndex) ? Math.trunc(nextIndex) : 0;
        return ((index % total) + total) % total;
    }

    function renderLightboxItem() {
        const item = lightboxItems[lightboxIndex];
        if (!item || !lightboxImage) return;

        lightboxImage.src = item.src;
        lightboxImage.alt = `Image ${lightboxIndex + 1}`;
        lightboxRoot.classList.toggle('gallery-lightbox--single', lightboxItems.length <= 1);
    }

    function stepLightbox(delta) {
        if (lightboxItems.length <= 1) return;
        lightboxIndex = normalizeLightboxIndex(lightboxIndex + delta);
        renderLightboxItem();
    }

    function openLightbox(items, startIndex = 0) {
        if (!Array.isArray(items) || items.length === 0) return;
        ensureLightbox();

        lastFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        lightboxItems = items;
        lightboxIndex = normalizeLightboxIndex(startIndex);
        renderLightboxItem();
        lightboxRoot.hidden = false;
        document.body.classList.add('has-gallery-lightbox');
        lightboxDialog?.focus();
    }

    function closeLightbox() {
        if (!lightboxRoot || lightboxRoot.hidden) return;

        lightboxRoot.hidden = true;
        document.body.classList.remove('has-gallery-lightbox');
        if (lightboxImage) {
            lightboxImage.removeAttribute('src');
            lightboxImage.alt = '';
        }
        lightboxRoot.classList.remove('gallery-lightbox--single');
        lightboxItems = [];
        lightboxIndex = 0;
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function mountGallery(rootElement) {
        if (!rootElement || typeof window.Splide !== 'function') {
            return null;
        }

        const mainElement = rootElement.querySelector('[data-gallery-role="main"]');
        const thumbsElement = rootElement.querySelector('[data-gallery-role="thumbs"]');
        if (!mainElement || !thumbsElement) {
            return null;
        }

        const slideCount = mainElement.querySelectorAll('.splide__slide').length;
        if (slideCount === 0) {
            return null;
        }

        if (!mainElement.querySelector('[data-gallery-nav]')) {
            mainElement.insertAdjacentHTML(
                'beforeend',
                `${createNavButtonHtml('prev', 'Show previous image')}${createNavButtonHtml('next', 'Show next image')}`
            );
        }

        const lightboxTriggers = Array.from(mainElement.querySelectorAll('.gallery-zoom-trigger'));
        const galleryItems = lightboxTriggers.map((element) => ({
            src: element.getAttribute('data-gallery-zoom-src') || ''
        }));

        // Splide options/API reference:
        // https://splidejs.com/guides/options/
        // https://splidejs.com/guides/apis/
        const main = new window.Splide(mainElement, {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            arrows: false,
            drag: true,
            pagination: false,
            speed: 650,
            rewind: false,
            lazyLoad: 'nearby'
        });

        const thumbs = new window.Splide(thumbsElement, {
            type: 'loop',
            isNavigation: true,
            arrows: false,
            pagination: false,
            drag: true,
            focus: 'center',
            gap: '8px',
            perPage: GALLERY_THUMBS_PER_PAGE,
            breakpoints: {
                768: {
                    perPage: GALLERY_THUMBS_PER_PAGE_MOBILE
                }
            }
        });

        const onMainClick = (event) => {
            const navAction = event.target.closest('[data-gallery-nav]')?.getAttribute('data-gallery-nav');
            const delta = getNavDelta(navAction);
            if (delta) {
                event.preventDefault();
                main.go(delta < 0 ? '<' : '>');
                return;
            }

            const trigger = event.target.closest('.gallery-zoom-trigger');
            if (!trigger) return;

            const startIndex = lightboxTriggers.indexOf(trigger);
            if (startIndex < 0) return;

            event.preventDefault();
            openLightbox(galleryItems, startIndex);
        };

        mainElement.addEventListener('click', onMainClick);

        main.sync(thumbs);
        thumbs.mount();
        main.mount();

        return () => {
            mainElement.removeEventListener('click', onMainClick);
            main.destroy(true);
            thumbs.destroy(true);
        };
    }

    function mountWidget(element) {
        if (!element || widgetDestroyers.has(element)) return;

        const type = (element.getAttribute('data-widget') || '').trim().toLowerCase();
        let destroy = null;

        if (type === 'gallery') {
            destroy = mountGallery(element);
        }

        if (typeof destroy === 'function') {
            widgetDestroyers.set(element, destroy);
        }
    }

    function destroyWidget(element) {
        if (!element || !widgetDestroyers.has(element)) return;

        const destroy = widgetDestroyers.get(element);
        widgetDestroyers.delete(element);
        if (typeof destroy === 'function') {
            destroy();
        }
    }

    function mountAll(root = document) {
        collectWidgetElements(root).forEach((element) => {
            mountWidget(element);
        });
    }

    function destroyAll(root = document) {
        collectWidgetElements(root).forEach((element) => {
            destroyWidget(element);
        });
        closeLightbox();
    }

    window.MarkdownWidgets = Object.freeze({
        mountAll,
        destroyAll
    });
})();
