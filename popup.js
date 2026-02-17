// Popup script for Text Clipper extension

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  document.getElementById('openFullView').addEventListener('click', () => {
    chrome.tabs.create({ url: 'fullview.html' });
  });
});

function loadData() {
  // Load folders
  chrome.runtime.sendMessage({ action: "getFolders" }, (response) => {
    const folders = response.folders || [];
    displayFolders(folders);
    document.getElementById('folderCount').textContent = folders.length;
  });
  
  // Load clips
  chrome.runtime.sendMessage({ action: "getClips" }, (response) => {
    const clips = response.clips || [];
    displayRecentClips(clips);
    document.getElementById('clipCount').textContent = clips.length;
  });
}

function displayFolders(folders) {
  const folderList = document.getElementById('folderList');
  
  if (folders.length === 0) {
    folderList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div>No folders yet. Select text on any page to create your first clip!</div>
      </div>
    `;
    return;
  }
  
  // Count clips per folder
  chrome.runtime.sendMessage({ action: "getClips" }, (response) => {
    const clips = response.clips || [];
    const folderClipCounts = {};
    
    clips.forEach(clip => {
      folderClipCounts[clip.folderId] = (folderClipCounts[clip.folderId] || 0) + 1;
    });
    
    folderList.innerHTML = folders.map(folder => `
      <div class="folder-item" data-folder-id="${folder.id}">
        <div class="folder-info">
          <span class="folder-icon">📁</span>
          <span class="folder-name">${escapeHtml(folder.name)}</span>
        </div>
        <span class="folder-count">${folderClipCounts[folder.id] || 0}</span>
      </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.folder-item').forEach(item => {
      item.addEventListener('click', () => {
        const folderId = item.dataset.folderId;
        chrome.tabs.create({ url: `fullview.html?folder=${folderId}` });
      });
    });
  });
}

function displayRecentClips(clips) {
  const recentClips = document.getElementById('recentClips');
  
  if (clips.length === 0) {
    recentClips.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div>No clips saved yet</div>
      </div>
    `;
    return;
  }
  
  const recent = clips.slice(0, 5); // Show only 5 most recent
  
  recentClips.innerHTML = recent.map(clip => `
    <div class="clip-item" data-clip-id="${clip.id}">
      <div class="clip-text">${escapeHtml(clip.text)}</div>
      <div class="clip-meta">
        <span>📁 ${escapeHtml(clip.folderName)}</span>
        <span>•</span>
        <span>${formatDate(clip.timestamp)}</span>
      </div>
    </div>
  `).join('');
  
  // Add click listeners
  document.querySelectorAll('.clip-item').forEach(item => {
    item.addEventListener('click', () => {
      const clipId = item.dataset.clipId;
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        chrome.tabs.create({ url: clip.url });
      }
    });
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}