// Full view script for Text Clipper extension

let allClips = [];
let allFolders = [];
let currentFolderId = 'all';
let currentSort = 'newest';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  // Check if a specific folder is requested via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const folderId = urlParams.get('folder');
  if (folderId) {
    currentFolderId = folderId;
  }
  
  loadData();
  setupEventListeners();
});

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    displayClips();
  });
  
  // Sort buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSort = e.target.dataset.sort;
      displayClips();
    });
  });
}

function loadData() {
  // Load folders
  chrome.runtime.sendMessage({ action: "getFolders" }, (response) => {
    allFolders = response.folders || [];
    //displayFolders();
    document.getElementById('totalFolders').textContent = allFolders.length;
  });
  
  // Load clips
  chrome.runtime.sendMessage({ action: "getClips" }, (response) => {
    allClips = response.clips || [];
    displayClips();
    displayFolders();
    document.getElementById('totalClips').textContent = allClips.length;
    document.getElementById('allClipsCount').textContent = allClips.length;
  });
}

function displayFolders() {
  const folderList = document.getElementById('folderList');
  
  // Count clips per folder
  const folderClipCounts = {};
  allClips.forEach(clip => {
    folderClipCounts[clip.folderId] = (folderClipCounts[clip.folderId] || 0) + 1;
  });
  
  // Keep the "All Clips" item and add other folders
  const allClipsItem = folderList.querySelector('[data-folder-id="all"]');
  
  const folderItems = allFolders.map(folder => `
    <div class="folder-item ${currentFolderId === folder.id ? 'active' : ''}" data-folder-id="${folder.id}">
      <div class="folder-item-info">
        <span class="folder-icon">📁</span>
        <span class="folder-name">${escapeHtml(folder.name)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="folder-count">${folderClipCounts[folder.id] || 0}</span>
        <div class="folder-actions">
          <button class="folder-delete" data-folder-id="${folder.id}" title="Delete folder">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
  
  folderList.innerHTML = '';
  folderList.appendChild(allClipsItem);
  folderList.insertAdjacentHTML('beforeend', folderItems);
  
  // Update active state for "All Clips"
  if (currentFolderId === 'all') {
    allClipsItem.classList.add('active');
  } else {
    allClipsItem.classList.remove('active');
  }
  
  // Add click listeners for folder items
  document.querySelectorAll('.folder-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't trigger if clicking delete button
      if (e.target.classList.contains('folder-delete')) return;
      
      currentFolderId = item.dataset.folderId;
      
      // Update active state
      document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
      item.classList.add('active');
      
      // Update title
      if (currentFolderId === 'all') {
        document.getElementById('clipsTitle').textContent = 'All Clips';
      } else {
        const folder = allFolders.find(f => f.id === currentFolderId);
        document.getElementById('clipsTitle').textContent = folder ? folder.name : 'Clips';
      }
      
      displayClips();
    });
  });
  
  // Add click listeners for delete buttons
  document.querySelectorAll('.folder-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const folderId = btn.dataset.folderId;
      const folder = allFolders.find(f => f.id === folderId);
      
      if (confirm(`Delete folder "${folder.name}" and all its clips?`)) {
        deleteFolder(folderId);
      }
    });
  });
}

function displayClips() {
  const clipsGrid = document.getElementById('clipsGrid');
  
  // Filter clips
  let filteredClips = allClips;
  
  // Filter by folder
  if (currentFolderId !== 'all') {
    filteredClips = filteredClips.filter(clip => clip.folderId === currentFolderId);
  }
  
  // Filter by search query
  if (searchQuery) {
    filteredClips = filteredClips.filter(clip => 
      clip.text.toLowerCase().includes(searchQuery) ||
      clip.pageTitle.toLowerCase().includes(searchQuery) ||
      clip.url.toLowerCase().includes(searchQuery) ||
      (clip.folderName || '').toLowerCase().includes(searchQuery)

      //clip.folderName.toLowerCase().includes(searchQuery)
    );
  }
  
  // Sort clips
  filteredClips.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return currentSort === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  // Display clips
  if (filteredClips.length === 0) {
    if (searchQuery) {
      clipsGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No clips found</h3>
          <p>Try a different search term</p>
        </div>
      `;
    } else {
      clipsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>No clips yet</h3>
          <p>Start saving text from web pages to see them here!</p>
        </div>
      `;
    }
    return;
  }
  
  clipsGrid.innerHTML = filteredClips.map(clip => {
    const highlightedText = highlightSearchTerm(clip.text, searchQuery);
    
    return `
      <div class="clip-card" data-clip-id="${clip.id}" data-url="${escapeHtml(clip.url)}">
        <div class="clip-header">
          <span class="clip-folder-tag">📁 ${escapeHtml(clip.folderName)}</span>
          <button class="clip-delete" data-clip-id="${clip.id}" title="Delete clip">🗑️</button>
        </div>
        <div class="clip-text">${highlightedText}</div>
        <div class="clip-footer">
          <div class="clip-source">
            <span>🔗</span>
            <span title="${escapeHtml(clip.pageTitle)}">${escapeHtml(clip.pageTitle)}</span>
          </div>
          <div class="clip-timestamp">⏱️ ${formatDate(clip.timestamp)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click listeners for clip cards
  document.querySelectorAll('.clip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open if clicking delete button
      if (e.target.classList.contains('clip-delete')) return;
      
      const url = card.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
  
  // Add click listeners for delete buttons
  document.querySelectorAll('.clip-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const clipId = btn.dataset.clipId;
      
      if (confirm('Delete this clip?')) {
        deleteClip(clipId);
      }
    });
  });
}

function deleteClip(clipId) {
  chrome.runtime.sendMessage({ action: "deleteClip", clipId }, (response) => {
    if (response.success) {
      // Remove from local array
      allClips = allClips.filter(clip => clip.id !== clipId);
      
      // Update display
      displayClips();
      document.getElementById('totalClips').textContent = allClips.length;
      document.getElementById('allClipsCount').textContent = allClips.length;
      displayFolders(); // Update folder counts
    }
  });
}

function deleteFolder(folderId) {
  chrome.runtime.sendMessage({ action: "deleteFolder", folderId }, (response) => {
    if (response.success) {
      // Remove from local arrays
      allFolders = allFolders.filter(folder => folder.id !== folderId);
      allClips = allClips.filter(clip => clip.folderId !== folderId);
      
      // If the deleted folder was selected, switch to "All Clips"
      if (currentFolderId === folderId) {
        currentFolderId = 'all';
        document.getElementById('clipsTitle').textContent = 'All Clips';
      }
      
      // Update display
      displayFolders();
      displayClips();
      document.getElementById('totalFolders').textContent = allFolders.length;
      document.getElementById('totalClips').textContent = allClips.length;
      document.getElementById('allClipsCount').textContent = allClips.length;
    }
  });
}

function highlightSearchTerm(text, query) {
  if (!query) return escapeHtml(text);
  
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapedText.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}