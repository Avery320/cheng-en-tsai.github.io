/**
 * 作品集應用程式
 * 支援動態分類系統
 */

class PortfolioApp {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.renderNavigation();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.handleInitialRoute();
    }

    /**
     * 處理初始路由
     */
    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        if (!hash || hash === 'about') {
            this.loadAbout(false);
        } else {
            const [category, id] = hash.split('/');
            if (category && id) {
                this.loadProject(category, id, false);
            } else {
                this.loadAbout(false);
            }
        }
    }

    /**
     * 載入設定檔
     */
    async loadConfig() {
        try {
            const response = await fetch('content/config.json');
            this.config = await response.json();

            // 確保 categories 存在
            if (!this.config.categories) {
                this.config.categories = [];
            }
        } catch (error) {
            console.error('無法載入設定檔:', error);
            this.config = { categories: [] };
        }
    }

    /**
     * 動態渲染導航選單
     */
    renderNavigation() {
        const nav = document.getElementById('nav');

        // 遍歷所有分類並動態生成
        this.config.categories.forEach(category => {
            const projects = this.config[category] || [];

            // 建立分類區塊
            const section = document.createElement('div');
            section.className = 'nav-section';

            // 建立分類標題
            const title = document.createElement('div');
            title.className = 'nav-title';
            title.dataset.section = category;
            title.textContent = category;
            section.appendChild(title);

            // 建立專案列表
            const list = document.createElement('ul');
            list.className = 'nav-list';
            list.id = `${category.toLowerCase()}List`;

            projects.forEach(id => {
                const li = document.createElement('li');
                li.className = 'nav-item';
                li.dataset.category = category;
                li.dataset.id = id;
                li.textContent = id;
                list.appendChild(li);
            });

            section.appendChild(list);
            nav.appendChild(section);
        });
    }

    /**
     * 設定事件監聽
     */
    setupEventListeners() {
        // 導航點擊事件（統一處理）
        document.getElementById('nav').addEventListener('click', (e) => {
            // 分類標題點擊
            if (e.target.classList.contains('nav-title')) {
                const section = e.target.dataset.section;
                if (section === 'about') {
                    this.updateHash('about');
                } else {
                    this.toggleSection(section);
                }
            }

            // 專案項目點擊
            if (e.target.classList.contains('nav-item')) {
                const category = e.target.dataset.category;
                const id = e.target.dataset.id;
                this.updateHash(`${category}/${id}`);
            }

            // 行動版：僅在跳轉頁面時關閉側邊欄
            // - 點擊項目 (nav-item)
            // - 點擊 ABOUT 標題
            if (e.target.classList.contains('nav-item') ||
                (e.target.classList.contains('nav-title') &&
                    e.target.dataset.section === 'about')) {
                this.closeMobileSidebar();
            }
        });

        // 監聽瀏覽器上一頁/下一頁
        window.addEventListener('hashchange', () => {
            this.handleInitialRoute();
        });

        // 監聽視窗縮放,重新計算圖片寬度
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.MarkdownExtensions && MarkdownExtensions.justifyImages) {
                    MarkdownExtensions.justifyImages();
                }
            }, 150);
        });
    }

    /**
     * 更新 URL Hash
     */
    updateHash(hash) {
        window.location.hash = hash;
    }

    /**
     * 切換分類展開/收合 (Accordion 效果)
     */
    toggleSection(section) {
        const allLists = document.querySelectorAll('.nav-list');
        const targetList = document.getElementById(`${section.toLowerCase()}List`);
        if (!targetList) return;

        const isExpanded = targetList.classList.contains('expanded');

        // 先收合所有列表
        allLists.forEach(list => list.classList.remove('expanded'));

        // 如果原本是收合的,則展開目標列表
        if (!isExpanded) {
            targetList.classList.add('expanded');
        }
    }

    /**
     * 載入 ABOUT 內容
     */
    async loadAbout(updateHash = true) {
        if (updateHash) this.updateHash('about');
        this.setActiveNav('about');

        try {
            const response = await fetch('content/about.md');
            const markdown = await response.text();
            this.renderContent(markdown);
        } catch (error) {
            this.renderContent('# About\n\n載入失敗');
        }
    }

    /**
     * 載入專案內容
     */
    async loadProject(category, id, updateHash = true) {
        if (updateHash) this.updateHash(`${category}/${id}`);
        this.setActiveNav(id, category);

        try {
            const response = await fetch(`content/${category}/${id}/content.md`);
            const markdown = await response.text();
            const processedMarkdown = this.processImagePaths(markdown, category, id);
            this.renderContent(processedMarkdown);
        } catch (error) {
            this.renderContent(`# ${id}\n\n載入失敗`);
        }
    }

    /**
     * 處理圖片路徑
     */
    processImagePaths(markdown, category, id) {
        return markdown.replace(/!\[(.*?)\]\(assets\/(.*?)\)/g,
            `![$1](content/${category}/${id}/assets/$2)`);
    }

    /**
     * 渲染內容
     */
    renderContent(markdown) {
        const wrapper = document.getElementById('contentWrapper');
        if (!wrapper) return;

        let processed = markdown;
        if (window.MarkdownExtensions) {
            processed = MarkdownExtensions.parse(markdown);
        }

        const html = marked.parse(processed);

        wrapper.innerHTML = html;
        wrapper.classList.remove('fade-in');
        void wrapper.offsetWidth;
        wrapper.classList.add('fade-in');

        if (window.MarkdownExtensions && MarkdownExtensions.justifyImages) {
            MarkdownExtensions.justifyImages();
        }
    }

    /**
     * 設定當前選中狀態
     */
    setActiveNav(id, category = null) {
        // 移除所有 active
        document.querySelectorAll('.nav-title, .nav-item').forEach(el => {
            el.classList.remove('active');
        });

        if (id === 'about') {
            document.querySelector('[data-section="about"]')?.classList.add('active');
        } else {
            // 設定專案 active
            const activeItem = document.querySelector(`.nav-item[data-id="${id}"]`);
            if (activeItem) activeItem.classList.add('active');

            // 確保分類展開
            const list = document.getElementById(`${category.toLowerCase()}List`);
            if (list) list.classList.add('expanded');

            // 收合其他分類
            document.querySelectorAll('.nav-list').forEach(l => {
                if (l !== list) l.classList.remove('expanded');
            });
        }
    }

    /**
     * 關閉行動版側邊欄
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    }

    /**
     * 設定行動裝置選單
     */
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!menuToggle || !sidebar || !overlay) return;

        // 漢堡按鈕點擊
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        // 遮罩層點擊關閉
        overlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});
