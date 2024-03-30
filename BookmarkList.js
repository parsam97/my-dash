class BookmarkList {
    constructor(bm_items) {
        this.bookmarks = [];
        this.bm_items = bm_items;

        document.addEventListener('openFolder', (e) => {
            const folder = e.detail.folder;
            this.bm_items = folder.children;
        });
    }

    get bookmarks() {
        return this._bookmarks;
    }
    set bookmarks(value) {
        this._bookmarks = value;
    }

    get bm_items() {
        return this._bm_items;
    }
    set bm_items(value) {
        this._bm_items = value;
        this.setNewBookmarkList(value);
    }

    setNewBookmarkList(bm_items) {
        for (var i = 0; i < bm_items.length; i++) {
            const bm_item = bm_items[i];
            try {
                const currBookmark = this.bookmarks[i];
                currBookmark.bm_item = bm_item;
                currBookmark.html;
            } catch (e) {
                this.bookmarks.push(new Bookmark(bm_item));
            }
        }

        if (this.bookmarks.length > bm_items.length) {
            for (var i = this.bookmarks.length - 1; i >= bm_items.length; i--) {
                this.bookmarks[i].formElement.remove();
                this.bookmarks.splice(i, 1);
            }
        }
    }

    get bookmarksHTML() {
        return this.getBookmarkFrag(false);
    }

    get foldersHTML() {
        return this.getBookmarkFrag(true);
    }

    getBookmarkFrag(folder) {
        const docFrag = document.createDocumentFragment();
        this.bookmarks.filter(bm => bm.isFolder === folder).forEach(bm => docFrag.appendChild(bm.html));
        return docFrag;
    }

    createEl(tagName, classList) {
        let element = document.createElement(tagName);
        if (classList) element.classList.add(...classList);
        return element;
    }
}