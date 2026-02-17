# 🧠 Brain Dumper – Chrome Text Clipper & Smart Note Organizer

A powerful Chrome Extension that lets users instantly save selected text from any webpage and organize it into structured folders — all inside the browser.

> Capture thoughts. Organize knowledge. Dump your brain — intelligently.

---

## 📌 Overview

Brain Dumper is a productivity-focused Chrome extension that allows users to:

- Save selected text from any webpage  
- Automatically store source links  
- Organize notes into folders  
- View, search, and manage clips in a clean dashboard  
- Track total folders and notes in real-time  

Built completely using **Vanilla JavaScript** and **Chrome Extension APIs (Manifest V3)**.

---

## 🚀 Motivation

While studying technical subjects like Operating Systems, DBMS, and DSA, I often copied text into scattered documents, lost sources, and struggled to organize information efficiently.

Brain Dumper solves this by turning the browser into a lightweight knowledge management system — enabling structured learning directly from web content.

---

## ✨ Key Features

### 📌 Text Clipping

- Select text on any webpage  
- Save it instantly  
- Automatically stores:
  - Selected content  
  - Source URL  
  - Timestamp  
  - Folder category  

---

### 📂 Folder-Based Organization

- Create multiple folders (e.g., OS, DBMS, DSA)  
- Automatically counts notes per folder  
- Dynamic folder rendering  
- Organized hierarchical structure  

---

### 🔎 Smart Search

Search clips by:

- Text content  
- Source link  
- Folder name  

Real-time filtering for quick retrieval.

---

### 📊 Dashboard View

Dedicated full-page interface (`fullview.html`) that displays:

- Total folders  
- Total notes  
- Recent notes  
- Sort by newest / oldest  
- Clean card-based UI  

---

### ⚡ Efficient Architecture

- Background script for state management  
- Popup UI for quick access  
- Full dashboard view for detailed organization  
- Chrome runtime messaging for communication  
- Persistent storage using Chrome Storage API  

---

## 🛠️ Tech Stack

- HTML5  
- CSS3  
- JavaScript
- Chrome Extension Manifest V3  
- Chrome Storage API  
- Chrome Runtime Messaging  
- DOM Manipulation  

---

## 🏗️ Project Structure

```
BrainDumper/
│
├── manifest.json
├── background.js
├── content.js
├── content.css
├── popup.html
├── popup.js
├── fullview.html
├── fullview.js
├── icons/
```

---

## 🧠 Architecture Flow

1. User selects text on a webpage  
2. `content.js` captures the selection  
3. Data is sent to `background.js`  
4. Background script:
   - Stores data in Chrome Storage  
   - Manages folder structure  
5. `popup.js` and `fullview.js` fetch data via runtime messaging  
6. UI dynamically updates note and folder counts  

---



- Popup view  
<p align="center">
  <img src="BRAINDUMPER_FINAL/POPUP.png" width="800"/>
</p>
- Full view
<p align="center">
  <img src="BRAINDUMPER_FINAL/FULLVIEW.png" width="800"/>
</p>


---

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/brain-dumper.git
```

2. Open Chrome and navigate to:

```
chrome://extensions/
```

3. Enable **Developer Mode**

4. Click **Load Unpacked**

5. Select the project folder

---

## 📈 What This Project Demonstrates

- Understanding of Chrome Extension architecture (Manifest V3)  
- Asynchronous messaging between scripts  
- State management without frameworks  
- Persistent storage using Chrome APIs  
- Clean modular frontend structure  
- Building a practical productivity tool from scratch  

---



