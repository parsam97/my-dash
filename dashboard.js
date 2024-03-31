let isCtrlPressed = false;

// Initialization functions
async function initializeDashboard() {
    try {
        await Promise.all([loadBookmarks(), loadOtherComponents()])

        // Listen for keydown event to set isCtrlPressed to true if Ctrl is pressed
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey) {
                this.isCtrlPressed = true;
            }
        });

        // Listen for keyup event to set isCtrlPressed to false when Ctrl is released
        document.addEventListener('keyup', function (event) {
            if (event.key === "Control") {
                this.isCtrlPressed = false;
            }
        });

        initializeSearch()
    } catch (error) {
        console.error('An error occurred while initializing the dashboard:', error);
    }
}
function initializeSearch() {
    document.addEventListener('keydown', function (e) {
        handleKeyEvents(e);
    })

    document.addEventListener('searchVisibilityChange', function (e) {
        handleSearchVisibilityChange(e);
    })
}
function setFocusOnFirstElement() {
    let firstFocusable = document.querySelector('.focusable');
    if (firstFocusable) {
        firstFocusable.classList.add('focused')
    }
}
function setupCustomFocus(containerSelector) {
    const container = document.querySelector(containerSelector);
    const columns = container.querySelectorAll('.contentCol');
    let currentColumnIndex = 0;
    let currentElementIndex = 0;
    let lastFocusedIndex = null;
    let lastAction = null;

    function updateFocus(switchedIndex) {
        if (currentColumnIndex === -1) {
            currentColumnIndex = 1;
        } else if (currentColumnIndex === 2) {
            currentColumnIndex = 0;
        }

        const focusableElements = columns[currentColumnIndex].querySelectorAll('.focusable');
        if (focusableElements.length === 0) return;
        lastFocusedIndex = currentElementIndex;

        if (switchedIndex) {
            currentElementIndex = switchedIndex;
        } else {
            currentElementIndex = Math.min(currentElementIndex, focusableElements.length - 1);
        }

        focusableElements[currentElementIndex].classList.add('focused');
        focusableElements[currentElementIndex].focus();
    }

    function clearFocus() {
        const focusedElement = container.querySelector('.focused');
        if (focusedElement) {
            focusedElement.classList.remove('focused');
        }
    }

    // document.addEventListener('keydown', function (event) {
    //     const key = event.key;
    //     if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
    //         event.preventDefault();
    //         clearFocus();
    //         let switching = false;

    //         if (key === 'Tab') {
    //             if (event.shiftKey) {
    //                 // Move focus backward within the column
    //                 currentElementIndex = Math.max(currentElementIndex - 1, 0);
    //                 currentColumnIndex -= 1;
    //             } else {
    //                 // Move focus forward within the column
    //                 currentElementIndex += 1;
    //                 currentColumnIndex += 1;
    //             }
    //         } else if (key === 'ArrowUp') {
    //             // Move focus upward within the column
    //             currentElementIndex = Math.max(currentElementIndex - 1, 0);
    //         } else if (key === 'ArrowDown') {
    //             // Move focus downward within the column
    //             currentElementIndex += 1;
    //         } else if (key === 'ArrowLeft' && currentColumnIndex > 0) {
    //             if (lastAction === 'ArrowRight') {
    //                 switching = true
    //             }
    //             // Move to the previous column
    //             currentColumnIndex -= 1;
    //         } else if (key === 'ArrowRight' && currentColumnIndex < columns.length - 1) {
    //             if (lastAction === 'ArrowLeft') {
    //                 switching = true
    //             }
    //             // Move to the next column
    //             currentColumnIndex += 1;
    //         } else if (key === 'Home') {
    //             currentElementIndex = 0;
    //         } else if (key === 'End') {
    //             const focusableElements = columns[currentColumnIndex].querySelectorAll('.focusable');
    //             currentElementIndex = focusableElements.length - 1;
    //         }


    //         lastAction = key;
    //         if (switching) {
    //             updateFocus(lastFocusedIndex);
    //         } else {
    //             updateFocus(null);
    //         }
    //     }

    //     if (event.ctrlKey && (key === 'Home' || key === 'End')) {
    //         event.preventDefault();
    //         clearFocus();
    //         const allFocusableElements = container.querySelectorAll('.focusable');
    //         if (key === 'Home') {
    //             currentColumnIndex = 0;
    //             currentElementIndex = 0;
    //         } else if (key === 'End') {
    //             currentColumnIndex = columns.length - 1;
    //             const focusableElements = columns[currentColumnIndex].querySelectorAll('.focusable');
    //             currentElementIndex = focusableElements.length - 1;
    //         }
    //         updateFocus();
    //     }
    // });
}

// Bookmark loading and rendering functions
async function loadBookmarks() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
            chrome.storage.local.get(['bookmarksBarName'], function(result) {
                var bookmarksBarName = result.bookmarksBarName;
                var bookmarksFolder = findBookmarksFolder(bookmarkTreeNodes, bookmarksBarName);
                if (bookmarksFolder) {
                    listFoldersAndBookmarks(bookmarksFolder);
                } else {
                    console.error('The "' + bookmarksBarName + '" folder was not found.');
                }
                resolve();
            });
        });
    });
}
async function loadOtherComponents() {
    // Use await for any asynchronous operations
    // For now, this is just a placeholder function
}
function findBookmarksFolder(bookmarks, folderName) {
    for (let item of bookmarks) {
        if (item.title === folderName) {
            return item;
        }
        if (item.children) {
            let found = findBookmarksFolder(item.children, folderName);
            if (found) {
                return found;
            }
        }
    }
    return null;
}
function listFoldersAndBookmarks(bookmarkFolder) {
    var foldersContainer = document.getElementById('foldersContainer');
    var bookmarksContainer = document.getElementById('bookmarksContainer');

    foldersContainer.innerHTML = ''; // Clear existing content
    bookmarksContainer.innerHTML = ''; // Clear existing content

    const bookmarkList = new BookmarkList(bookmarkFolder.children);
    foldersContainer.appendChild(bookmarkList.foldersHTML);
    bookmarksContainer.appendChild(bookmarkList.bookmarksHTML);
    // foldersContainer.bm_items = [];

    document.addEventListener('bookmarkClick', (e) => {
        const bookmark = e.detail.bookmark;

        if (bookmark.isFolder) {
            bookmarkList.setNewBookmarkList(bookmark.children);
            // document.dispatchEvent(new CustomEvent('openFolder', {
            //     detail: { folder: bookmark }
            // }));
        } else {
            if (this.isCtrlPressed) {
                chrome.tabs.create({ url: bookmark.url, active: false });
            } else {
                checkOrUpdateTab(bookmark);
            }
        }
    });
}
function checkOrUpdateTab(bookmark) {
    chrome.tabs.query({}, function (tabs) {
        const matchingTab = tabs.find(tab => tab.url.startsWith(bookmark.url));
        if (matchingTab) {
            // Matching tab found, navigate to that tab
            chrome.tabs.update(matchingTab.id, { active: true });
        } else {
            // No matching tab found, update the current tab to the bookmark's URL
            chrome.tabs.query({ active: true, currentWindow: true }, function (currentTabs) {
                const currentTab = currentTabs[0];
                if (currentTab) {
                    chrome.tabs.update(currentTab.id, { url: bookmark.url });
                }
            });
        }
    });
}

// Input search functions
function changeSearchVisibility(show) {
    const searchContainer = document.getElementById('searchContainer')

    // Check if current state is already desired state
    if (searchContainer.show === show) {
        return;
    }

    // Update state
    searchContainer.show = show;

    // Create a CustomEvent with details
    const searchVisibilityChangeEvent = new CustomEvent('searchVisibilityChange', {
        detail: { showInput: show }
    });

    // Dispatch the event
    document.dispatchEvent(searchVisibilityChangeEvent);
}
function giveInputFocus() {
    const input = document.getElementById('input');
    input.focus();
}
function clearInput() {
    const input = document.getElementById('input');
    input.value = '';
}
function handleKeyEvents(e) {
    const key = e.key;
    if (key === 'Escape') {
        changeSearchVisibility(false);
        clearInput();
    } else if (key.length === 1) {
        changeSearchVisibility(true);
        giveInputFocus();
    }
}
function handleSearchVisibilityChange(e) {
    // Toggle visibility
    if (e.detail.showInput) {
        searchContainer.classList.remove('hideSearchContainer');
    } else {
        searchContainer.classList.add('hideSearchContainer');
    }
}

// Utility functions
function isBookmark(bookmarkItem) {
    return bookmarkItem.url !== undefined;
}

// Initialize Dashboard
initializeDashboard();