document.getElementById('saveButton').addEventListener('click', function () {
    var bookmarksBarName = document.getElementById('bookmarksBarName').value;
    chrome.storage.local.set({ bookmarksBarName: bookmarksBarName }, function () {
        console.log('Bookmarks bar name is set to ' + bookmarksBarName);
    });
    
});

document.getElementById('openDashboardButton').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['bookmarksBarName'], function (result) {
        var bookmarksBarName = result.bookmarksBarName;
        document.getElementById('bookmarksBarName').value = bookmarksBarName;
    });
});