/**
 * 文件大綱控制器
 * - 收集 h1~h6
 * - 生成樹狀目錄
 * - 捲動同步 active 狀態
 */
class DocumentOutline {
    constructor(options = {}) {
        this.dom = {
            outlinePanel: options.outlinePanel || null,
            outlineNav: options.outlineNav || null,
            outlineTitle: options.outlineTitle || null,
            contentWrapper: options.contentWrapper || null,
            contentScroll: options.contentScroll || null
        };

        this.getHash = typeof options.getHash === 'function'
            ? options.getHash
            : () => window.location.hash;
        this.decodeRouteSegment = typeof options.decodeRouteSegment === 'function'
            ? options.decodeRouteSegment
            : (segment) => String(segment || '');

        this.tree = [];
        this.headings = [];
        this.nodesById = new Map();
        this.parentById = new Map();
        this.linkById = new Map();
        this.collapsedNodeIds = new Set();
        this.activeId = '';

        this.removeScrollListener = null;
        this.scrollTicking = false;

        this.bindEvents();
    }

    bindEvents() {
        const { outlineNav } = this.dom;
        if (!outlineNav) return;

        outlineNav.addEventListener('click', (event) => {
            const toggleButton = event.target.closest('.outline-node-toggle');
            if (toggleButton) {
                this.toggleNode(toggleButton.dataset.id || '');
                return;
            }

            const linkButton = event.target.closest('.outline-link');
            if (linkButton) {
                this.scrollToHeading(linkButton.dataset.id || '');
            }
        });
    }

    beforeRender() {
        this.detachScrollListener();
    }

    render() {
        const { outlinePanel, outlineNav } = this.dom;
        if (!outlinePanel || !outlineNav) return;

        const headings = this.collectHeadings();
        this.headings = headings;
        this.updateTitle();

        if (headings.length === 0) {
            this.tree = [];
            this.headings = [];
            this.nodesById = new Map();
            this.parentById = new Map();
            this.linkById = new Map();
            this.collapsedNodeIds.clear();
            this.activeId = '';
            outlineNav.innerHTML = '';
            this.detachScrollListener();
            outlinePanel.classList.add('is-empty');
            return;
        }

        const treeState = this.buildTree(headings);
        this.tree = treeState.tree;
        this.nodesById = treeState.nodesById;
        this.parentById = treeState.parentById;
        this.collapsedNodeIds = new Set(
            Array.from(this.collapsedNodeIds).filter((id) => treeState.collapsibleNodeIds.has(id))
        );

        this.renderNavigation();
        outlinePanel.classList.remove('is-empty');
        this.bindScrollSync();
    }

    updateTitle() {
        const { outlineTitle } = this.dom;
        if (!outlineTitle) return;

        const hash = this.getHash().replace(/^#/, '').trim();
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

    collectHeadings() {
        const { contentWrapper } = this.dom;
        if (!contentWrapper) return [];

        const headingElements = Array.from(contentWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6'));
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
            return { id, title, level, element };
        });
    }

    buildTree(headings) {
        const tree = [];
        const stack = [];
        const nodesById = new Map();
        const parentById = new Map();
        const collapsibleNodeIds = new Set();

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

    renderNavigation() {
        const { outlineNav } = this.dom;
        if (!outlineNav) return;

        this.linkById = new Map();
        const renderNodes = (nodes) => {
            const list = document.createElement('ul');
            list.className = 'outline-list';

            nodes.forEach((node) => {
                const item = document.createElement('li');
                item.className = 'outline-item';

                const row = document.createElement('div');
                row.className = 'outline-row';

                if (node.children.length > 0) {
                    const isCollapsed = this.collapsedNodeIds.has(node.id);
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
                this.linkById.set(node.id, linkButton);
                row.appendChild(linkButton);
                item.appendChild(row);

                if (node.children.length > 0) {
                    const childList = renderNodes(node.children);
                    childList.classList.add('outline-children');
                    childList.hidden = this.collapsedNodeIds.has(node.id);
                    item.appendChild(childList);
                }

                list.appendChild(item);
            });

            return list;
        };

        outlineNav.innerHTML = '';
        outlineNav.appendChild(renderNodes(this.tree));
        this.setActiveItem(this.activeId, { forceUpdate: true });
    }

    toggleNode(nodeId) {
        if (!nodeId) return;

        if (this.collapsedNodeIds.has(nodeId)) {
            this.collapsedNodeIds.delete(nodeId);
        } else {
            this.collapsedNodeIds.add(nodeId);
        }

        this.renderNavigation();
    }

    scrollToHeading(headingId) {
        if (!headingId) return;

        this.expandAncestors(headingId);
        const headingElement = this.nodesById.get(headingId)?.element || document.getElementById(headingId);
        if (!headingElement) return;

        headingElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        this.setActiveItem(headingId);
    }

    expandAncestors(headingId) {
        let currentParentId = this.parentById.get(headingId);
        let changed = false;

        while (currentParentId) {
            if (this.collapsedNodeIds.delete(currentParentId)) {
                changed = true;
            }
            currentParentId = this.parentById.get(currentParentId);
        }

        if (changed) {
            this.renderNavigation();
        }
    }

    bindScrollSync() {
        const { contentScroll } = this.dom;
        if (!contentScroll || this.headings.length === 0) return;

        this.detachScrollListener();

        const handleScroll = () => {
            if (this.scrollTicking) return;
            this.scrollTicking = true;

            window.requestAnimationFrame(() => {
                this.scrollTicking = false;
                this.updateActiveByScroll();
            });
        };

        contentScroll.addEventListener('scroll', handleScroll, { passive: true });
        this.removeScrollListener = () => {
            contentScroll.removeEventListener('scroll', handleScroll);
        };

        this.updateActiveByScroll();
    }

    updateActiveByScroll() {
        const { contentScroll } = this.dom;
        if (!contentScroll || this.headings.length === 0) return;

        const panelTop = contentScroll.getBoundingClientRect().top;
        const activationOffset = 96;
        let activeId = this.headings[0].id;

        for (const heading of this.headings) {
            const headingTop = heading.element.getBoundingClientRect().top - panelTop;
            if (headingTop <= activationOffset) {
                activeId = heading.id;
                continue;
            }
            break;
        }

        this.setActiveItem(activeId);
    }

    setActiveItem(headingId, options = {}) {
        const { forceUpdate = false } = options;
        const nextActiveId = headingId || '';
        const previousActiveId = this.activeId;
        if (!forceUpdate && previousActiveId === nextActiveId) return;

        this.activeId = nextActiveId;

        if (forceUpdate) {
            this.linkById.forEach((button) => {
                button.classList.remove('active');
                button.removeAttribute('aria-current');
            });
        } else if (previousActiveId) {
            const previousButton = this.linkById.get(previousActiveId);
            if (previousButton) {
                previousButton.classList.remove('active');
                previousButton.removeAttribute('aria-current');
            }
        }

        const activeButton = this.linkById.get(this.activeId);
        if (!activeButton) return;

        activeButton.classList.add('active');
        activeButton.setAttribute('aria-current', 'true');
        if (previousActiveId !== this.activeId) {
            activeButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    detachScrollListener() {
        if (typeof this.removeScrollListener === 'function') {
            this.removeScrollListener();
            this.removeScrollListener = null;
        }
        this.scrollTicking = false;
    }
}

window.DocumentOutline = DocumentOutline;
