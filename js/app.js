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
            homeLink: document.getElementById('homeLink')
        };

        this.init();
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

        nav.querySelectorAll('.nav-section').forEach((section) => section.remove());

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
        const { sidebar, sidebarOverlay, menuToggle, homeLink } = this.dom;
        const setMenuOpen = (isOpen) => {
            if (!sidebar || !sidebarOverlay) return;

            const shouldOpen = Boolean(isOpen);
            sidebar.classList.toggle('open', shouldOpen);
            sidebar.setAttribute('aria-hidden', String(!shouldOpen));
            sidebarOverlay.classList.toggle('active', shouldOpen);
            menuToggle?.setAttribute('aria-expanded', String(shouldOpen));
            menuToggle?.setAttribute('aria-label', shouldOpen ? '關閉專案選單' : '開啟專案選單');
        };
        const closeMenu = () => setMenuOpen(false);

        const nav = this.dom.nav;
        if (nav) {
            nav.addEventListener('click', (event) => {
                const titleElement = event.target.closest('.nav-title');
                if (titleElement) {
                    const section = titleElement.dataset.section;
                    if (section) {
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
                closeMenu();
            });
        }

        homeLink?.addEventListener('click', (event) => {
            event.preventDefault();
            this.navigateHome();
            closeMenu();
        });

        window.addEventListener('hashchange', () => {
            this.handleInitialRoute();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.justifyImages();
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

        if (!menuToggle || !sidebar || !sidebarOverlay) return;
        menuToggle.addEventListener('click', () => {
            setMenuOpen(!sidebar.classList.contains('open'));
        });
        sidebarOverlay.addEventListener('click', closeMenu);
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sidebar.classList.contains('open')) {
                closeMenu();
            }
        });
        closeMenu();
    }

    navigateHome() {
        const homeConfig = this.getPageConfigByHash('about');
        if (!homeConfig) return;

        if (window.location.hash === '#about') {
            this.loadPage(homeConfig, false);
            return;
        }

        this.updateHash('about');
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
        this.destroyWidgets();
        this.resetContentScroll();

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

    resetContentScroll() {
        const contentScroll = this.dom.contentScroll;
        if (!contentScroll) return;
        contentScroll.scrollTop = 0;
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

        const extensionsApi = window.MarkdownExtensions;

        const html = (extensionsApi && typeof extensionsApi.render === 'function')
            ? extensionsApi.render(markdown)
            : marked.parse(markdown);

        wrapper.innerHTML = html;
        wrapper.classList.remove('fade-in');
        void wrapper.offsetWidth;
        wrapper.classList.add('fade-in');

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

        if (id === 'about') return;

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
