// Background service worker for Text Clipper extension

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveTextClip",
    title: "Save to Brain Dumper",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveTextClip") {
    // Send message to content script to show folder selector
    chrome.tabs.sendMessage(tab.id, {
      action: "showFolderSelector",
      selectedText: info.selectionText,
      pageUrl: tab.url,
      pageTitle: tab.title
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getFolders") {
    chrome.storage.local.get(["folders"], (result) => {
      sendResponse({ folders: result.folders || [] });
    });
    return true;
  }
  
  if (request.action === "getClips") {
    chrome.storage.local.get(["clips"], (result) => {
      sendResponse({ clips: result.clips || [] });
    });
    return true;
  }
  
  if (request.action === "saveFolder") {
    chrome.storage.local.get(["folders"], (result) => {
      const folders = result.folders || [];
      folders.push(request.folder);
      chrome.storage.local.set({ folders }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.action === "saveClip") {
    chrome.storage.local.get(["clips"], (result) => {
      const clips = result.clips || [];
      clips.unshift(request.clip); // Add to beginning for most recent first
      chrome.storage.local.set({ clips }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.action === "deleteClip") {
    chrome.storage.local.get(["clips"], (result) => {
      const clips = result.clips || [];
      const updatedClips = clips.filter(clip => clip.id !== request.clipId);
      chrome.storage.local.set({ clips: updatedClips }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.action === "deleteFolder") {
    chrome.storage.local.get(["folders", "clips"], (result) => {
      const folders = result.folders || [];
      const clips = result.clips || [];
      
      // Remove folder
      const updatedFolders = folders.filter(folder => folder.id !== request.folderId);
      
      // Remove clips in that folder
      const updatedClips = clips.filter(clip => clip.folderId !== request.folderId);
      
      chrome.storage.local.set({ 
        folders: updatedFolders, 
        clips: updatedClips 
      }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});