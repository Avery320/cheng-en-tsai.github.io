/**
 * Portfolio 應用程式
 * - 動態分類導航
 * - Markdown 內容渲染
 */
class PortfolioApp {
    constructor() {
        this.config = { categories: [] };
        this.pageRequestId = 0;

        this.dom = {
            nav: document.getElementById('nav'),
            contentScroll: document.getElementById('contentScroll'),
            contentWrapper: document.getElementById('contentWrapper'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            menuToggle: document.getElementById('menuToggle'),
            outlinePanel: document.getElementById('outlinePanel'),
            outlineNav: document.getElementById('outlineNav'),
            outlineTitle: document.getElementById('outlineTitle')
        };

        this.outline = this.createOutlineController();
        this.init();
    }

    createOutlineController() {
        if (typeof window.DocumentOutline !== 'function') return null;

        return new window.DocumentOutline({
            outlinePanel: this.dom.outlinePanel,
            outlineNav: this.dom.outlineNav,
            outlineTitle: this.dom.outlineTitle,
            contentWrapper: this.dom.contentWrapper,
            contentScroll: this.dom.contentScroll,
            getHash: () => window.location.hash,
            decodeRouteSegment: (segment) => this.decodeRouteSegment(segment)
        });
    }

    async init() {
        await this.loadConfig();
        this.renderNavigation();
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    handleInitialRoute() {
        const hash = window.location.hash.replace(/^#/, '').trim();

        if (!hash || hash === 'home') {
            this.updateHash('about');
            return;
        }

        const pageConfig = this.getPageConfigByHash(hash);
        if (pageConfig) {
            this.loadPage(pageConfig, false);
            return;
        }

        this.updateHash('about');
    }

    decodeRouteSegment(segment) {
        const value = String(segment || '').trim();
        if (!value) return '';

        try {
            return decodeURIComponent(value);
        } catch (_error) {
            return value;
        }
    }

    getPageConfigByHash(hash) {
        if (hash === 'about') {
            return {
                hash: 'about',
                navId: 'about',
                markdownPath: 'content/about.md',
                fallbackMarkdown: '# About\n\n載入失敗'
            };
        }

        const [rawCategory, rawId] = hash.split('/');
        const category = this.decodeRouteSegment(rawCategory);
        const id = this.decodeRouteSegment(rawId);
        if (!category || !id) return null;

        return {
            hash: `${category}/${id}`,
            navId: id,
            navCategory: category,
            markdownPath: `content/${category}/${id}/content.md`,
            fallbackMarkdown: `# ${id}\n\n載入失敗`,
            transformMarkdown: (markdown) => this.processImagePaths(markdown, category, id)
        };
    }

    async loadConfig() {
        try {
            const response = await fetch('content/config.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const config = await response.json();
            this.config = {
                ...config,
                categories: Array.isArray(config.categories) ? config.categories : []
            };
        } catch (error) {
            console.error('無法載入設定檔:', error);
            this.config = { categories: [] };
        }
    }

    renderNavigation() {
        const nav = this.dom.nav;
        if (!nav) return;

        const sections = Array.from(nav.querySelectorAll('.nav-section'));
        sections.slice(1).forEach((section) => section.remove());

        this.config.categories.forEach((category) => {
            const projects = Array.isArray(this.config[category]) ? this.config[category] : [];

            const section = document.createElement('div');
            section.className = 'nav-section';

            const title = document.createElement('div');
            title.className = 'nav-title';
            title.dataset.section = category;
            title.textContent = category;

            const list = document.createElement('ul');
            list.className = 'nav-list';
            list.id = `${category.toLowerCase()}List`;

            projects.forEach((id) => {
                const item = document.createElement('li');
                item.className = 'nav-item';
                item.dataset.category = category;
                item.dataset.id = id;
                item.textContent = id;
                list.appendChild(item);
            });

            section.appendChild(title);
            section.appendChild(list);
            nav.appendChild(section);
        });
    }

    setupEventListeners() {
        const { sidebar, sidebarOverlay } = this.dom;
        const closeSidebar = () => {
            if (!sidebar || !sidebarOverlay) return;
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        };

        const nav = this.dom.nav;
        if (nav) {
            nav.addEventListener('click', (event) => {
                const titleElement = event.target.closest('.nav-title');
                if (titleElement) {
                    const section = titleElement.dataset.section;
                    if (section === 'about') {
                        this.updateHash('about');
                        closeSidebar();
                    } else if (section) {
                        const targetList = document.getElementById(`${section.toLowerCase()}List`);
                        if (!targetList) return;
                        this.setExpandedNavList(targetList, !targetList.classList.contains('expanded'));
                    }
                    return;
                }

                const itemElement = event.target.closest('.nav-item');
                if (!itemElement) return;

                const category = itemElement.dataset.category;
                const id = itemElement.dataset.id;
                if (!category || !id) return;

                this.updateHash(`${category}/${id}`);
                closeSidebar();
            });
        }

        window.addEventListener('hashchange', () => {
            this.handleInitialRoute();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.justifyImages();
                this.outline?.updateActiveByScroll();
            }, 150);
        });

        const contentWrapper = this.dom.contentWrapper;
        if (contentWrapper) {
            contentWrapper.addEventListener('click', (event) => {
                const iframeContainer = event.target
                    .closest('[data-iframe-action="fullscreen"]')
                    ?.closest('.iframe-container');
                if (!iframeContainer) return;

                event.preventDefault();
                this.requestFullscreen(iframeContainer);
            });
        }

        if (!this.dom.menuToggle || !sidebar || !sidebarOverlay) return;
        this.dom.menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    requestFullscreen(element) {
        if (!element) return;

        const requestMethod = element?.requestFullscreen
            || element.webkitRequestFullscreen
            || element.mozRequestFullScreen
            || element.msRequestFullscreen;
        if (typeof requestMethod !== 'function') return;

        try {
            const requestResult = requestMethod.call(element);
            requestResult?.catch?.((error) => console.warn('無法啟用全螢幕模式:', error));
        } catch (error) {
            console.warn('無法啟用全螢幕模式:', error);
        }
    }

    updateHash(hash) {
        const targetHash = `#${hash}`;
        if (window.location.hash !== targetHash) {
            window.location.hash = hash;
        }
    }

    setExpandedNavList(targetList, isExpanded) {
        document.querySelectorAll('.nav-list').forEach((list) => {
            list.classList.toggle('expanded', Boolean(isExpanded) && list === targetList);
        });
    }

    async loadPage(pageConfig, updateHash = true) {
        const requestId = ++this.pageRequestId;

        if (updateHash) {
            this.updateHash(pageConfig.hash);
        }

        this.setActiveNav(pageConfig.navId, pageConfig.navCategory ?? null);
        let markdown = pageConfig.fallbackMarkdown;
        try {
            const response = await fetch(pageConfig.markdownPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            markdown = await response.text();
        } catch (error) {
            console.error(`無法載入檔案: ${pageConfig.markdownPath}`, error);
        }

        const renderedMarkdown = typeof pageConfig.transformMarkdown === 'function'
            ? pageConfig.transformMarkdown(markdown)
            : markdown;

        if (requestId !== this.pageRequestId) return;
        this.renderContent(renderedMarkdown);
    }

    processImagePaths(markdown, category, id) {
        const basePath = `content/${category}/${id}`;
        const resolveAssetPath = (url) => {
            const cleanUrl = url.trim();
            if (!cleanUrl.startsWith('assets/')) return cleanUrl;
            return `${basePath}/${cleanUrl}`;
        };

        return markdown
            .replace(
                /!\[([^\]]*)\]\(\s*(assets\/[^)\s]+)\s*\)(\s*\{[^}\n]*\})?/g,
                (_match, title, url, options = '') => `![${title}](${resolveAssetPath(url)})${options}`
            )
            .replace(
                /@(video|gif|iframe)\s*\[([^\]]*)\]\s*\(\s*(assets\/[^)\s]+)\s*\)(\s*\{[^}\n]*\})?/g,
                (_match, directive, title, url, options = '') => `@${directive}[${title}](${resolveAssetPath(url)})${options}`
            )
            .replace(
                /@cover\s*\(\s*(assets\/[^)\s]+)\s*\)/g,
                (_match, url) => `@cover(${resolveAssetPath(url)})`
            );
    }

    renderContent(markdown) {
        const wrapper = this.dom.contentWrapper;
        if (!wrapper) return;

        this.outline?.beforeRender();
        this.destroyWidgets();
        const extensionsApi = window.MarkdownExtensions;

        const html = (extensionsApi && typeof extensionsApi.render === 'function')
            ? extensionsApi.render(markdown)
            : marked.parse(markdown);

        wrapper.innerHTML = html;
        wrapper.classList.remove('fade-in');
        void wrapper.offsetWidth;
        wrapper.classList.add('fade-in');

        this.outline?.render();
        this.justifyImages();
        this.mountWidgets();
    }

    justifyImages() {
        const extensionsApi = window.MarkdownExtensions;
        if (extensionsApi && typeof extensionsApi.justifyImages === 'function') {
            extensionsApi.justifyImages();
        }
    }

    destroyWidgets() {
        if (window.MarkdownWidgets && typeof window.MarkdownWidgets.destroyAll === 'function') {
            window.MarkdownWidgets.destroyAll(this.dom.contentWrapper);
        }
    }

    mountWidgets() {
        if (window.MarkdownWidgets && typeof window.MarkdownWidgets.mountAll === 'function') {
            window.MarkdownWidgets.mountAll(this.dom.contentWrapper);
        }
    }

    setActiveNav(id, category = null) {
        document.querySelectorAll('.nav-title, .nav-item').forEach((element) => {
            element.classList.remove('active');
        });

        if (id === 'about') {
            document.querySelector('[data-section="about"]')?.classList.add('active');
            return;
        }

        const activeItem = document.querySelector(`.nav-item[data-id="${id}"]`);
        if (activeItem) activeItem.classList.add('active');

        const list = category
            ? document.getElementById(`${category.toLowerCase()}List`)
            : null;

        if (list) {
            this.setExpandedNavList(list, true);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});
