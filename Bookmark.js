class Bookmark {
    constructor(bm_item) {
        this.defineProperties();
        if (bm_item) this.bm_item = bm_item;
    }

    defineProperties() {
        this.defineElementProperty('imgElement', 'img');
        this.defineElementProperty('spanTextElement', 'span');
        this.defineElementProperty('buttonElement', 'button', ['bookmark-item-button']);
        this.defineElementProperty('formElement', 'form');
    }

    get bm_item() {
        return this._bm_item;
    }
    set bm_item(value) {
        this._bm_item = value;
        this.setNewBookmark();
    }

    setNewBookmark() {
        this.id = this.bm_item.id;
        this.title = this.bm_item.title;
        this.url = this.bm_item.url;
        this.parentId = this.bm_item.parentId;
        this.children = this.bm_item.children;
        this.isFolder = this.bm_item.url === undefined;

        this.imgElement.src = this.faviconUrl;
        this.spanTextElement.textContent = this.title;
        this.buttonElement.setAttribute('type', 'submit');
        this.formElement.setAttribute('method', 'get');
    }

    createEl(tagName, classList) {
        let element = document.createElement(tagName);
        if (classList) element.classList.add(...classList);
        return element;
    }

    get html() {
        // Bookmark container
        const container = this.createEl('div', ['bookmark-container']);

        // Icon column
        const iconCol = this.createEl('div', ['bookmark-col']);
        iconCol.appendChild(this.imgElement)
        container.appendChild(iconCol);

        // Title column (if there is)
        this.title = this.title.trim();
        if (this.title.length > 0) {
            const titleCol = this.createEl('div', ['bookmark-col']);
            titleCol.appendChild(this.spanTextElement)
            container.appendChild(titleCol);
        }

        // Add button
        this.buttonElement.appendChild(container);

        // Form
        this.formElement.appendChild(this.buttonElement);
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('bookmarkClick', {
                detail: { bookmark: this, event: e }
            }));
        });

        return this.formElement;
    }

    get faviconUrl() {
        // Folder
        if (this.isFolder) {
            return favicon_links['folder']
        }

        // Custom icons
        if (this.url in favicon_links) {
            return favicon_links[this.url]
        }

        // Standard server location
        return `https://${new URL(this.url).hostname}/favicon.ico`;
    }

    defineElementProperty(propertyName, tag, classList) {
        Object.defineProperty(this, propertyName, {
            get: function() {
                if (!this['_' + propertyName]) {
                    this['_' + propertyName] = this.createEl(tag, classList);
                }
                return this['_' + propertyName];
            },
            set: function(value) {
                this['_' + propertyName] = value;
            }
        });
    }
}