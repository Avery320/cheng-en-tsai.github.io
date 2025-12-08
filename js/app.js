/**
 * 作品集應用程式
 */

class PortfolioApp {
    constructor() {
        this.config = null;
        this.currentSection = null;
        this.currentProject = null;

        this.init();
    }

    async init() {
        await this.loadConfig();
        this.renderNavigation();
        this.setupEventListeners();

        // 根據目前的 Hash 載入內容，如果沒有 Hash 則預設載入 About
        this.handleInitialRoute();
    }

    /**
     * 處理初始路由
     */
    handleInitialRoute() {
        const hash = window.location.hash.slice(1); // 移除 #
        if (!hash || hash === 'about') {
            this.loadAbout(false); // false = 不更新 hash (避免循環)
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
        } catch (error) {
            console.error('無法載入設定檔:', error);
            this.config = { PROJECT: [], DEVELOP: [] };
        }
    }

    /**
     * 渲染導航選單
     */
    renderNavigation() {
        // 渲染 PROJECT 列表
        const projectList = document.getElementById('projectList');
        this.config.PROJECT.forEach(id => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.dataset.category = 'PROJECT';
            li.dataset.id = id;
            li.textContent = id;
            projectList.appendChild(li);
        });

        // 渲染 DEVELOP 列表
        const developList = document.getElementById('developList');
        this.config.DEVELOP.forEach(id => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.dataset.category = 'DEVELOP';
            li.dataset.id = id;
            li.textContent = id;
            developList.appendChild(li);
        });
    }

    /**
     * 設定事件監聯
     */
    setupEventListeners() {
        // 分類標題點擊
        document.querySelectorAll('.nav-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const section = e.target.dataset.section;

                if (section === 'about') {
                    this.updateHash('about');
                } else {
                    this.toggleSection(section);
                }
            });
        });

        // 專案項目點擊 (使用事件委派)
        document.querySelector('.sidebar').addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item')) {
                const category = e.target.dataset.category;
                const id = e.target.dataset.id;
                this.updateHash(`${category}/${id}`);
            }
        });

        // 監聽瀏覽器上一頁/下一頁
        window.addEventListener('hashchange', () => {
            this.handleInitialRoute();
        });

        // 監聽視窗縮放,重新計算圖片寬度 (使用 debounce 優化效能)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.MarkdownExtensions && MarkdownExtensions.justifyImages) {
                    MarkdownExtensions.justifyImages();
                }
            }, 150); // 150ms debounce
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
        const targetList = document.getElementById(section === 'PROJECT' ? 'projectList' : 'developList');
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

            // 處理相對路徑的圖片
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
        // 將 assets/ 轉換為完整路徑
        return markdown.replace(/!\[(.*?)\]\(assets\/(.*?)\)/g,
            `![$1](content/${category}/${id}/assets/$2)`);
    }

    /**
     * 渲染內容
     */
    renderContent(markdown) {
        const wrapper = document.getElementById('contentWrapper');
        if (!wrapper) return;

        // 使用 MarkdownExtensions 解析自訂語法 (網格、iframe、video)
        let processed = markdown;
        if (window.MarkdownExtensions) {
            processed = MarkdownExtensions.parse(markdown);
        } else {
            console.warn('MarkdownExtensions module not found');
        }

        // 使用 marked 解析標準 Markdown
        const html = marked.parse(processed);

        wrapper.innerHTML = html;
        wrapper.classList.remove('fade-in'); // 重置動畫
        void wrapper.offsetWidth; // 觸發 reflow
        wrapper.classList.add('fade-in');

        // 計算 Justified Image Gallery 寬度
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
            const list = document.getElementById(category === 'PROJECT' ? 'projectList' : 'developList');
            if (list) list.classList.add('expanded');

            // 收合其他分類 (保持 Accordion 效果)
            document.querySelectorAll('.nav-list').forEach(l => {
                if (l !== list) l.classList.remove('expanded');
            });
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});
