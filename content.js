// Content script for Text Clipper extension

let selectedText = "";
let pageUrl = "";
let pageTitle = "";

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showFolderSelector") {
    selectedText = request.selectedText;
    pageUrl = request.pageUrl;
    pageTitle = request.pageTitle;
    showFolderSelectorModal();
  }
});

function showFolderSelectorModal() {
  // Remove existing modal if any
  const existingModal = document.getElementById("text-clipper-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "text-clipper-modal";
  modal.className = "text-clipper-modal";
  
  // Create modal content
  modal.innerHTML = `
    <div class="text-clipper-modal-content">
      <div class="text-clipper-modal-header">
        <h3>Save Text Clip</h3>
        <button class="text-clipper-close">&times;</button>
      </div>
      <div class="text-clipper-modal-body">
        <div class="text-clipper-preview">
          <strong>Selected text:</strong>
          <p>${selectedText.substring(0, 150)}${selectedText.length > 150 ? '...' : ''}</p>
        </div>
        <div class="text-clipper-folder-section">
          <label>Choose a folder:</label>
          <select id="text-clipper-folder-select" class="text-clipper-select">
            <option value="">Loading folders...</option>
          </select>
        </div>
        <div class="text-clipper-new-folder-section">
          <input type="text" id="text-clipper-new-folder" class="text-clipper-input" placeholder="Or create new folder...">
        </div>
        <div class="text-clipper-actions">
          <button id="text-clipper-cancel" class="text-clipper-btn text-clipper-btn-secondary">Cancel</button>
          <button id="text-clipper-save" class="text-clipper-btn text-clipper-btn-primary">Save Clip</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load folders
  loadFolders();
  
  // Event listeners
  modal.querySelector(".text-clipper-close").addEventListener("click", closeModal);
  modal.querySelector("#text-clipper-cancel").addEventListener("click", closeModal);
  modal.querySelector("#text-clipper-save").addEventListener("click", saveClip);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function loadFolders() {
  chrome.runtime.sendMessage({ action: "getFolders" }, (response) => {
    const select = document.getElementById("text-clipper-folder-select");
    select.innerHTML = '<option value="">Select a folder...</option>';
    
    if (response.folders && response.folders.length > 0) {
      response.folders.forEach(folder => {
        const option = document.createElement("option");
        option.value = folder.id;
        option.textContent = folder.name;
        select.appendChild(option);
      });
    }
  });
}

function saveClip() {
  const folderSelect = document.getElementById("text-clipper-folder-select");
  const newFolderInput = document.getElementById("text-clipper-new-folder");
  
  let folderId = folderSelect.value;
  let folderName = folderSelect.options[folderSelect.selectedIndex]?.text;
  
  // Check if creating a new folder
  if (newFolderInput.value.trim()) {
    folderId = Date.now().toString();
    folderName = newFolderInput.value.trim();
    
    // Save new folder
    chrome.runtime.sendMessage({
      action: "saveFolder",
      folder: {
        id: folderId,
        name: folderName,
        createdAt: new Date().toISOString()
      }
    });
  }
  
  if (!folderId) {
    alert("Please select or create a folder");
    return;
  }
  
  // Save the clip
  const clip = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text: selectedText,
    url: pageUrl,
    pageTitle: pageTitle,
    folderId: folderId,
    folderName: folderName,
    timestamp: new Date().toISOString()
  };
  
  chrome.runtime.sendMessage({ action: "saveClip", clip }, (response) => {
    if (response.success) {
      showSuccessMessage();
      closeModal();
    }
  });
}

function showSuccessMessage() {
  const message = document.createElement("div");
  message.className = "text-clipper-success";
  message.textContent = "✓ Clip saved successfully!";
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.opacity = "0";
    setTimeout(() => message.remove(), 300);
  }, 2000);
}

function closeModal() {
  const modal = document.getElementById("text-clipper-modal");
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 200);
  }
}