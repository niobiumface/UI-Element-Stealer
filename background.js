chrome.runtime.onInstalled.addListener(() => {
    // Create main context menu item
    chrome.contextMenus.create({
      id: "stealElement",
      title: "Steal Element",
      contexts: ["all"]
    });
    
    // Create context menu for managing categories
    chrome.contextMenus.create({
      id: "manageCategories",
      title: "Manage Categories",
      contexts: ["all"]
    });
  });
  
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "stealElement") {
      // Check if the URL is valid for script injection
      // Cannot inject into chrome:// URLs, extension pages, or the Chrome Web Store
      const url = tab.url || '';
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.includes('chrome.google.com/webstore')) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon48.png'),
          title: 'UI Element Stealer',
          message: 'Cannot steal elements from this page. Try a regular website instead.'
        });
        return;
      }
      
      // First, ensure the content script and CSS are injected
      Promise.all([
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }),
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        })
      ]).then(() => {
        // Then send the message
        chrome.tabs.sendMessage(tab.id, { action: "startSelection" });
      }).catch(error => {
        console.error("Error injecting content script or CSS:", error);
      });
    } else if (info.menuItemId === "manageCategories") {
      chrome.tabs.create({ url: "categories.html" });
    }
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveElement") {
      saveElementToStorage(request.element, sendResponse);
      return true;
    }
  });
  
  function saveElementToStorage(element, callback) {
    chrome.storage.local.get({ elements: [], categories: ["Default"] }, (data) => {
      const elements = data.elements;
      elements.push({
        ...element,
        id: Date.now(),
        category: element.category || "Default"
      });
      
      chrome.storage.local.set({ elements }, () => {
        if (callback) callback({ success: true });
      });
    });
  }
