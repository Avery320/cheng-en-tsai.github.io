/**
 * Portfolio 應用程式
 * - 動態分類導航
 * - Markdown 內容渲染
 * - 文件標題面板（h1~h6）
 */
class PortfolioApp {
    /**
     * 初始化應用程式的狀態與 DOM 快取。
     */
    constructor() {
        this.config = { categories: [] };

        this.dom = {
            nav: document.getElementById('nav'),
            contentPanel: document.getElementById('contentPanel'),
            contentScroll: document.getElementById('contentScroll'),
            contentWrapper: document.getElementById('contentWrapper'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            menuToggle: document.getElementById('menuToggle'),
            outlinePanel: document.getElementById('outlinePanel'),
            outlineNav: document.getElementById('outlineNav'),
            outlineTitle: document.getElementById('outlineTitle')
        };

        this.outlineTree = [];
        this.outlineHeadings = [];
        this.outlineNodesById = new Map();
        this.outlineParentById = new Map();
        this.outlineLinkById = new Map();
        this.outlineCollapsedNodeIds = new Set();
        this.activeOutlineId = '';

        this.removeOutlineScrollListener = null;
        this.outlineScrollTicking = false;

        this.init();
    }

    /**
     * 啟動流程：載入設定、渲染導覽、綁定事件、處理初始路由。
     */
    async init() {
        await this.loadConfig();
        this.renderNavigation();
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    /**
     * 解析目前 hash，並導向 about 或對應專案頁。
     */
    handleInitialRoute() {
        // hash 規則：
        // - 空值/home -> about
        // - about -> about.md
        // - category/id -> 專案頁
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

    /**
     * 安全解碼 hash 路由片段，失敗時回退原字串。
     */
    decodeRouteSegment(segment) {
        const value = String(segment || '').trim();
        if (!value) return '';

        try {
            return decodeURIComponent(value);
        } catch (_error) {
            return value;
        }
    }

    /**
     * 依 hash 產生頁面載入設定。
     * about -> about.md；category/id -> content/<category>/<id>/content.md
     */
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

    /**
     * 讀取導航設定檔 content/config.json。
     */
    async loadConfig() {
        try {
            const response = await fetch('content/config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

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

    /**
     * 依 config 動態建立左側導航結構。
     */
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

    /**
     * 綁定所有互動事件：導覽點擊、路由變更、視窗縮放、大綱互動、行動版選單。
     */
    setupEventListeners() {
        const { sidebar, sidebarOverlay } = this.dom;
        // 行動版側欄關閉邏輯集中在同一個函式，避免事件中重複操作 class。
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
                this.updateActiveOutlineByScroll();
            }, 150);
        });

        const { outlineNav, menuToggle } = this.dom;
        if (outlineNav) {
            outlineNav.addEventListener('click', (event) => {
                const toggleButton = event.target.closest('.outline-node-toggle');
                if (toggleButton) {
                    this.toggleOutlineNode(toggleButton.dataset.id || '');
                    return;
                }

                const linkButton = event.target.closest('.outline-link');
                if (linkButton) {
                    this.scrollToHeading(linkButton.dataset.id || '');
                }
            });
        }

        if (!menuToggle || !sidebar || !sidebarOverlay) return;
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    /**
     * 更新 URL hash，避免重複寫入造成多餘事件。
     */
    updateHash(hash) {
        const targetHash = `#${hash}`;
        if (window.location.hash !== targetHash) {
            window.location.hash = hash;
        }
    }

    /**
     * 設定展開中的導航清單（單選展開）。
     */
    setExpandedNavList(targetList, isExpanded) {
        document.querySelectorAll('.nav-list').forEach((list) => {
            list.classList.toggle('expanded', Boolean(isExpanded) && list === targetList);
        });
    }

    /**
     * 載入頁面 Markdown 並渲染到主內容區。
     */
    async loadPage(pageConfig, updateHash = true) {
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

        this.renderContent(renderedMarkdown);
    }

    /**
     * 將專案內 assets 相對路徑改寫為可直接載入的絕對相對路徑。
     */
    processImagePaths(markdown, category, id) {
        const basePath = `content/${category}/${id}`;
        const resolveAssetPath = (url) => {
            const cleanUrl = url.trim();
            if (!cleanUrl.startsWith('assets/')) return cleanUrl;
            // 將專案內相對資源路徑補成完整路徑。
            return `${basePath}/${cleanUrl}`;
        };

        return markdown
            .replace(
                /!\[([^\]]*)\]\(\s*(assets\/[^)\s]+)\s*\)/g,
                (_match, title, url) => `![${title}](${resolveAssetPath(url)})`
            )
            .replace(
                /@(video|gif|iframe)\s*\[([^\]]*)\]\s*\(\s*(assets\/[^)\s]+)\s*\)/g,
                (_match, directive, title, url) => `@${directive}[${title}](${resolveAssetPath(url)})`
            )
            .replace(
                /@cover\s*\(\s*(assets\/[^)\s]+)\s*\)/g,
                (_match, url) => `@cover(${resolveAssetPath(url)})`
            );
    }

    /**
     * 將 Markdown 轉為 HTML 並刷新內容與大綱。
     */
    renderContent(markdown) {
        const wrapper = this.dom.contentWrapper;
        if (!wrapper) return;

        this.detachOutlineScrollListener();

        const html = (window.MarkdownExtensions && typeof MarkdownExtensions.render === 'function')
            ? MarkdownExtensions.render(markdown)
            : marked.parse(markdown);

        wrapper.innerHTML = html;
        wrapper.classList.remove('fade-in');
        void wrapper.offsetWidth;
        wrapper.classList.add('fade-in');

        this.justifyImages();
        this.renderDocumentOutline();
    }

    /**
     * 重新計算 grid 圖片寬度（由 MarkdownExtensions 提供）。
     */
    justifyImages() {
        if (window.MarkdownExtensions && typeof MarkdownExtensions.justifyImages === 'function') {
            MarkdownExtensions.justifyImages();
        }
    }

    /**
     * 更新目前被選中的導航項目。
     */
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

    /**
     * 重新建立文件大綱（h1~h6）並綁定捲動同步。
     */
    renderDocumentOutline() {
        const { outlinePanel, outlineNav } = this.dom;
        if (!outlinePanel || !outlineNav) return;

        // 先收集標題，再統一更新大綱狀態與視圖。
        const headings = this.collectOutlineHeadings();
        this.outlineHeadings = headings;
        this.updateOutlineTitle();

        if (headings.length === 0) {
            this.outlineTree = [];
            this.outlineHeadings = [];
            this.outlineNodesById = new Map();
            this.outlineParentById = new Map();
            this.outlineLinkById = new Map();
            this.outlineCollapsedNodeIds.clear();
            this.activeOutlineId = '';
            outlineNav.innerHTML = '';
            this.detachOutlineScrollListener();
            outlinePanel.classList.add('is-empty');
            return;
        }

        const treeState = this.buildOutlineTree(headings);
        this.outlineTree = treeState.tree;
        this.outlineNodesById = treeState.nodesById;
        this.outlineParentById = treeState.parentById;
        this.outlineCollapsedNodeIds = new Set(
            Array.from(this.outlineCollapsedNodeIds).filter((id) => treeState.collapsibleNodeIds.has(id))
        );

        this.renderOutlineNavigation();

        outlinePanel.classList.remove('is-empty');
        this.bindOutlineScrollSync();
    }

    /**
     * 依當前路由更新大綱標題（ABOUT 或專案名稱）。
     */
    updateOutlineTitle() {
        const outlineTitle = this.dom.outlineTitle;
        if (!outlineTitle) return;

        const hash = window.location.hash.replace(/^#/, '').trim();
        if (!hash || hash === 'about') {
            outlineTitle.textContent = 'ABOUT';
            return;
        }

        const [, rawProjectId] = hash.split('/');
        const projectId = this.decodeRouteSegment(rawProjectId);
        const normalized = String(projectId || '')
            .trim()
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ');
        outlineTitle.textContent = normalized ? normalized.toUpperCase() : 'PROJECT';
    }

    /**
     * 收集內容區中的 h1~h6，並保證每個標題都有唯一 id。
     */
    collectOutlineHeadings() {
        const wrapper = this.dom.contentWrapper;
        if (!wrapper) return [];

        const headingElements = Array.from(wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const usedIds = new Set();
        const createHeadingId = (element, title, index) => {
            const existingId = (element.id || '').trim();
            if (existingId && !usedIds.has(existingId)) {
                usedIds.add(existingId);
                return existingId;
            }

            const baseId = String(title)
                .toLowerCase()
                .trim()
                .replace(/[^\p{L}\p{N}\s-]/gu, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || `section-${index + 1}`;

            // 若 slug 重複，使用遞增尾碼確保唯一。
            let nextId = baseId;
            let suffix = 2;
            while (usedIds.has(nextId)) {
                nextId = `${baseId}-${suffix}`;
                suffix += 1;
            }

            element.id = nextId;
            usedIds.add(nextId);
            return nextId;
        };

        return headingElements.map((element, index) => {
            const title = (element.textContent || '').trim() || `Section ${index + 1}`;
            const level = Number(element.tagName.slice(1));
            const id = createHeadingId(element, title, index);

            return {
                id,
                title,
                level,
                element
            };
        });
    }

    /**
     * 將線性標題列表轉為樹狀結構，並建立 parent/id 索引。
     */
    buildOutlineTree(headings) {
        const tree = [];
        const stack = [];
        const nodesById = new Map();
        const parentById = new Map();
        const collapsibleNodeIds = new Set();

        // 以 stack 單次走訪建立 h1~h6 階層樹。
        headings.forEach((heading) => {
            const node = { ...heading, parentId: null, children: [] };
            nodesById.set(node.id, node);

            while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1] || null;
            if (parent) {
                node.parentId = parent.id;
                parent.children.push(node);
                parentById.set(node.id, parent.id);
                collapsibleNodeIds.add(parent.id);
            } else {
                tree.push(node);
            }

            stack.push(node);
        });

        return { tree, nodesById, parentById, collapsibleNodeIds };
    }

    /**
     * 依目前樹狀資料渲染左側大綱面板。
     */
    renderOutlineNavigation() {
        const outlineNav = this.dom.outlineNav;
        if (!outlineNav) return;

        this.outlineLinkById = new Map();
        // 遞迴渲染樹狀節點並同步建立 id -> 按鈕索引，供 active 更新快速查找。
        const renderNodes = (nodes) => {
            const list = document.createElement('ul');
            list.className = 'outline-list';

            nodes.forEach((node) => {
                const item = document.createElement('li');
                item.className = 'outline-item';

                const row = document.createElement('div');
                row.className = 'outline-row';

                if (node.children.length > 0) {
                    const isCollapsed = this.outlineCollapsedNodeIds.has(node.id);
                    const toggleButton = document.createElement('button');
                    toggleButton.type = 'button';
                    toggleButton.className = 'outline-node-toggle';
                    toggleButton.dataset.id = node.id;
                    toggleButton.textContent = isCollapsed ? '▸' : '⌵';
                    toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
                    toggleButton.setAttribute('aria-label', `${isCollapsed ? '展開' : '收合'} ${node.title}`);
                    row.appendChild(toggleButton);
                } else {
                    const spacer = document.createElement('span');
                    spacer.className = 'outline-node-spacer';
                    row.appendChild(spacer);
                }

                const linkButton = document.createElement('button');
                linkButton.type = 'button';
                linkButton.className = 'outline-link';
                linkButton.dataset.id = node.id;
                linkButton.textContent = node.title;
                linkButton.style.setProperty('--outline-level', String(node.level));
                this.outlineLinkById.set(node.id, linkButton);
                row.appendChild(linkButton);
                item.appendChild(row);

                if (node.children.length > 0) {
                    const childList = renderNodes(node.children);
                    childList.classList.add('outline-children');
                    childList.hidden = this.outlineCollapsedNodeIds.has(node.id);
                    item.appendChild(childList);
                }

                list.appendChild(item);
            });

            return list;
        };

        outlineNav.innerHTML = '';
        outlineNav.appendChild(renderNodes(this.outlineTree));
        this.setActiveOutlineItem(this.activeOutlineId, { forceUpdate: true });
    }

    /**
     * 切換大綱節點展開/收合狀態。
     */
    toggleOutlineNode(nodeId) {
        if (!nodeId) return;

        if (this.outlineCollapsedNodeIds.has(nodeId)) {
            this.outlineCollapsedNodeIds.delete(nodeId);
        } else {
            this.outlineCollapsedNodeIds.add(nodeId);
        }

        this.renderOutlineNavigation();
    }

    /**
     * 捲動至指定標題，並同步更新 active 狀態。
     */
    scrollToHeading(headingId) {
        if (!headingId) return;

        this.expandOutlineAncestors(headingId);

        const headingElement = this.outlineNodesById.get(headingId)?.element || document.getElementById(headingId);
        if (!headingElement) return;

        headingElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        this.setActiveOutlineItem(headingId);
    }

    /**
     * 展開目前標題的所有父節點，確保 active 項可見。
     */
    expandOutlineAncestors(headingId) {
        let currentParentId = this.outlineParentById.get(headingId);
        let changed = false;

        while (currentParentId) {
            if (this.outlineCollapsedNodeIds.delete(currentParentId)) {
                changed = true;
            }
            currentParentId = this.outlineParentById.get(currentParentId);
        }

        if (changed) {
            this.renderOutlineNavigation();
        }
    }

    /**
     * 綁定內容捲動事件，驅動大綱 active 同步。
     */
    bindOutlineScrollSync() {
        const headings = this.outlineHeadings;
        const contentScroll = this.dom.contentScroll || this.dom.contentPanel;
        if (!contentScroll || headings.length === 0) return;

        this.detachOutlineScrollListener();

        // 使用 requestAnimationFrame 節流，避免滾動時高頻 DOM 讀寫。
        const handleScroll = () => {
            if (this.outlineScrollTicking) return;
            this.outlineScrollTicking = true;

            window.requestAnimationFrame(() => {
                this.outlineScrollTicking = false;
                this.updateActiveOutlineByScroll();
            });
        };

        contentScroll.addEventListener('scroll', handleScroll, { passive: true });
        this.removeOutlineScrollListener = () => {
            contentScroll.removeEventListener('scroll', handleScroll);
        };

        this.updateActiveOutlineByScroll();
    }

    /**
     * 根據內容區可視位置推算當前 active 標題。
     */
    updateActiveOutlineByScroll() {
        const headings = this.outlineHeadings;
        const contentScroll = this.dom.contentScroll || this.dom.contentPanel;
        if (!contentScroll || headings.length === 0) return;

        const panelTop = contentScroll.getBoundingClientRect().top;
        const activationOffset = 96;
        let activeId = headings[0].id;

        for (const heading of headings) {
            const headingTop = heading.element.getBoundingClientRect().top - panelTop;
            if (headingTop <= activationOffset) {
                activeId = heading.id;
                continue;
            }
            break;
        }

        this.setActiveOutlineItem(activeId);
    }

    /**
     * 套用大綱 active 樣式，僅更新必要節點。
     */
    setActiveOutlineItem(headingId, options = {}) {
        const { forceUpdate = false } = options;
        const nextActiveId = headingId || '';
        const previousActiveId = this.activeOutlineId;
        if (!forceUpdate && previousActiveId === nextActiveId) {
            return;
        }

        this.activeOutlineId = nextActiveId;

        // 僅更新前後兩個節點狀態，避免每次全量掃描。
        if (forceUpdate) {
            this.outlineLinkById.forEach((linkButton) => {
                linkButton.classList.remove('active');
                linkButton.removeAttribute('aria-current');
            });
        } else if (previousActiveId) {
            const previousButton = this.outlineLinkById.get(previousActiveId);
            if (previousButton) {
                previousButton.classList.remove('active');
                previousButton.removeAttribute('aria-current');
            }
        }

        const activeButton = this.outlineLinkById.get(this.activeOutlineId);
        if (!activeButton) return;

        activeButton.classList.add('active');
        activeButton.setAttribute('aria-current', 'true');

        if (previousActiveId !== this.activeOutlineId) {
            activeButton.scrollIntoView({
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    /**
     * 解除內容捲動監聽，避免重複綁定與記憶體洩漏。
     */
    detachOutlineScrollListener() {
        if (typeof this.removeOutlineScrollListener === 'function') {
            this.removeOutlineScrollListener();
            this.removeOutlineScrollListener = null;
        }

        this.outlineScrollTicking = false;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});
