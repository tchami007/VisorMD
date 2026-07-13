import styles from './styles.css';
import katexCss from 'katex/dist/katex.min.css';
import markdownit from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import footnote from 'markdown-it-footnote';
import texmath from 'markdown-it-texmath';
import mermaid from 'mermaid';
import hljs from 'highlight.js';
import katex from 'katex';

const style = document.createElement('style');
style.textContent = styles;
document.head.appendChild(style);

const katexStyle = document.createElement('style');
katexStyle.textContent = katexCss;
document.head.appendChild(katexStyle);

mermaid.initialize({
  startOnLoad: false,
  theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
});

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (str, lang) => {
    if (lang === 'mermaid') return '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch { }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

md.use(taskLists, { enabled: true, label: true, labelAfter: true });
md.use(footnote);
md.use(texmath, { engine: katex, delimiters: 'dollars', katexOptions: { throwOnError: false } });
const preview = document.getElementById('preview');
const welcome = document.getElementById('welcome');
const toc = document.getElementById('toc');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');
const sidebar = document.getElementById('sidebar');
const tabList = document.getElementById('tab-list');
const tabContainer = document.getElementById('tab-content-container');
const contentEl = document.getElementById('content');
const progressBar = document.getElementById('reading-progress');
document.getElementById('theme-selector').addEventListener('change', (e) => setTheme(e.target.value));
document.getElementById('btn-search').addEventListener('click', toggleSearch);
document.getElementById('btn-open').addEventListener('click', () => sendToBackend({ type: 'show-open-dialog' }));
document.getElementById('btn-print').addEventListener('click', printContent);
document.getElementById('btn-new-tab').addEventListener('click', () => sendToBackend({ type: 'show-open-dialog' }));
document.getElementById('hidden-file-input').addEventListener('change', onFileSelected);
document.getElementById('search-close').addEventListener('click', hideSearch);
document.getElementById('search-prev').addEventListener('click', () => searchMove(-1));
document.getElementById('search-next').addEventListener('click', () => searchMove(1));

searchInput.addEventListener('input', onSearchInput);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); searchMove(e.shiftKey ? -1 : 1); }
  if (e.key === 'Escape') hideSearch();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); toggleSearch(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); document.getElementById('hidden-file-input').click(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); printContent(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (activeTabId) closeTab(activeTabId); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
    e.preventDefault();
    if (tabs.length < 2) return;
    const idx = tabs.findIndex(t => t.id === activeTabId);
    const dir = e.shiftKey ? -1 : 1;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    switchTab(next.id);
  }
});

// Middle-click to close tabs
tabList.addEventListener('mousedown', (e) => {
  if (e.button === 1) {
    const tab = e.target.closest('.tab-btn');
    if (tab) {
      e.preventDefault();
      closeTab(parseInt(tab.dataset.tabId));
    }
  }
});

// Reading progress on scroll
contentEl.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = contentEl;
  const max = scrollHeight - clientHeight;
  const pct = max > 0 ? Math.round((scrollTop / max) * 100) : 100;
  progressBar.style.setProperty('--progress', pct + '%');
});

// Drag and drop
document.addEventListener('dragover', (e) => { e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
    openDroppedFile(file);
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Tabs ----
let tabs = [];
let activeTabId = null;
let tabIdCounter = 0;

function openInTab(content, name, filePath) {
  if (filePath) {
    const existing = tabs.find(t => t.path === filePath);
    if (existing) {
      updateTabContent(existing.id, content, name, filePath);
      switchTab(existing.id);
      return;
    }
  }

  const id = ++tabIdCounter;
  const tab = { id, name: name || '', path: filePath || '', scrollTop: 0 };
  tabs.push(tab);

  const btn = document.createElement('div');
  btn.className = 'tab-btn';
  btn.dataset.tabId = id;
  btn.innerHTML = `<span class="tab-name">${escapeHtml(tab.name || 'sin título')}</span><span class="tab-close" data-tab-id="${id}">×</span>`;
  btn.addEventListener('click', () => switchTab(id));
  tabList.appendChild(btn);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'tab-content';
  contentDiv.dataset.tabId = id;
  tabContainer.appendChild(contentDiv);

  welcome.style.display = 'none';
  renderTabContent(id, content || '', name, filePath);
  switchTab(id);
}

function renderTabContent(tabId, content, name, filePath) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  tab.name = name || tab.name;
  tab.path = filePath || tab.path;
  tab.content = content;

  const div = tabContainer.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
  if (!div) return;

  const html = md.render(content || '');
  div.innerHTML = html;

  const mermaidBlocks = div.querySelectorAll('pre code.language-mermaid');
  mermaidBlocks.forEach((block) => {
    const pre = block.parentElement;
    const text = block.textContent;
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = text;
    pre.replaceWith(mermaidDiv);
  });
  if (mermaidBlocks.length > 0) {
    mermaid.run({ nodes: div.querySelectorAll('.mermaid') }).catch(console.error);
  }

  const isActive = tabId === activeTabId;
  if (isActive) {
    updateFileInfo(tab);
    buildToc();
  }
}

function switchTab(id) {
  if (activeTabId === id) return;

  if (activeTabId) {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab) activeTab.scrollTop = contentEl.scrollTop;
  }

  activeTabId = id;

  tabList.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.tabId) === id));

  tabContainer.querySelectorAll('.tab-content').forEach(div => {
    div.classList.toggle('active', parseInt(div.dataset.tabId) === id);
  });

  preview.style.display = 'none';
  welcome.style.display = 'none';

  const tab = tabs.find(t => t.id === id);
  if (tab) {
    updateFileInfo(tab);
    progressBar.style.setProperty('--progress', '0%');
    buildToc();
    requestAnimationFrame(() => {
      contentEl.scrollTop = tab.scrollTop || 0;
    });
  }
}

function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;

  tabList.querySelector(`.tab-btn[data-tab-id="${id}"]`)?.remove();
  tabContainer.querySelector(`.tab-content[data-tab-id="${id}"]`)?.remove();

  const wasActive = activeTabId === id;
  tabs.splice(idx, 1);

  if (wasActive) {
    if (tabs.length > 0) {
      const newIdx = Math.min(idx, tabs.length - 1);
      switchTab(tabs[newIdx].id);
    } else {
      activeTabId = null;
      welcome.style.display = 'block';
      preview.style.display = 'none';
      document.getElementById('file-name').textContent = 'VisorMD';
      document.getElementById('file-path').textContent = '';
      document.title = 'VisorMD';
      progressBar.style.setProperty('--progress', '0%');
      buildToc();
    }
  }
}

function updateTabContent(tabId, content, name, filePath) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  renderTabContent(tabId, content, name, filePath);
}

function updateFileInfo(tab) {
  document.getElementById('file-name').textContent = tab.name || 'VisorMD';
  document.getElementById('file-path').textContent = tab.path || '';
  document.title = `VisorMD - ${tab.name || ''}`;
}

function getActiveContentDiv() {
  if (!activeTabId) return null;
  return tabContainer.querySelector(`.tab-content.active`);
}

// IPC
function handleBackendMessage(data) {
  switch (data.type) {
    case 'file-loaded':
      openInTab(data.content, data.fileName, data.filePath);
      break;
    case 'file-changed':
      if (data.filePath) {
        const tab = tabs.find(t => t.path === data.filePath);
        if (tab) {
          updateTabContent(tab.id, data.content, data.fileName || tab.name, data.filePath);
        }
      }
      break;
    case 'set-theme':
      if (data.theme) setTheme(data.theme);
      break;
  }
}

function receiveMessage(msg) {
  console.log('receiveMessage called:', msg);
  try {
    const data = typeof msg === 'string' ? JSON.parse(msg) : msg;
    console.log('Parsed data:', data);
    handleBackendMessage(data);
  } catch (e) {
    console.error('IPC error:', e);
  }
}

// PhotinoX exposes window.external.receiveMessage(callback) as a registration
// function — call it with our handler rather than overriding it.
if (window.external?.sendMessage && window.external?.receiveMessage) {
  window.external.receiveMessage(function(msg) {
    receiveMessage(msg);
  });
} else {
  window.external = window.external || {};
  window.external.receiveMessage = receiveMessage;
}

function sendToBackend(msg) {
  const json = JSON.stringify(msg);
  console.log('sendToBackend:', msg.type, 'sendMessage exists:', !!window.external?.sendMessage);
  try {
    if (window.external?.sendMessage) {
      window.external.sendMessage(json);
      console.log('sendToBackend: sent successfully');
    } else {
      console.warn('sendToBackend: window.external.sendMessage not available');
    }
  } catch (e) {
    console.error('sendToBackend error:', e);
  }
}

// Notify backend that the frontend is ready to receive files
(function tryAppReady() {
  if (window.external?.sendMessage) {
    sendToBackend({ type: 'app-ready' });
  } else {
    setTimeout(tryAppReady, 500);
  }
})();

function printContent() {
  const contentDiv = getActiveContentDiv();
  const content = contentDiv ? contentDiv.innerHTML : '';
  if (!content) return;
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Imprimir</title><style>' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:40px;line-height:1.6;color:#1a1a1a}' +
    'table{border-collapse:collapse;width:100%;margin:12px 0}' +
    'th,td{border:1px solid #ccc;padding:8px;text-align:left}' +
    'img{max-width:100%}' +
    'pre{background:#f5f5f5;padding:16px;border-radius:4px;overflow-x:auto}' +
    'code{font-family:"SF Mono",Consolas,monospace;background:#f0f0f0;padding:2px 6px;border-radius:3px;font-size:13px}' +
    'pre code{background:none;padding:0}' +
    'blockquote{border-left:4px solid #0366d6;padding:8px 16px;margin:12px 0;background:#f5f5f5;color:#666}' +
    'h1,h2,h3{margin-top:24px}' +
    'h1{border-bottom:1px solid #ddd;padding-bottom:8px}' +
    'h2{border-bottom:1px solid #ddd;padding-bottom:6px}' +
    'a{color:#0366d6}' +
    '.mermaid svg{max-width:100%}' +
    '</style></head><body>' + content + '</body></html>');
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(function() { document.body.removeChild(iframe); }, 1000);
}

function openDroppedFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => openInTab(e.target.result, file.name, '');
  reader.readAsText(file);
}

function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => openInTab(ev.target.result, file.name, '');
  reader.readAsText(file);
  e.target.value = '';
}

// ---- TOC ----
function buildToc() {
  toc.innerHTML = '';
  const contentDiv = getActiveContentDiv() || preview;
  const headings = contentDiv.querySelectorAll('h1, h2, h3, h4');
  if (headings.length === 0) return;

  const stack = [];
  const root = document.createElement('ul');
  root.className = 'toc-tree';
  toc.appendChild(root);
  stack.push({ ul: root, level: 0 });

  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    h.id = id;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = h.textContent;
    a.className = 'toc-item';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
      toc.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
    });
    li.appendChild(a);

    const idx = Array.from(headings).indexOf(h);
    const nextH = headings[idx + 1];
    const nextLevel = nextH ? parseInt(nextH.tagName[1]) : 0;

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.ul || root;
    parent.appendChild(li);

    if (nextLevel > level) {
      const details = document.createElement('details');
      details.className = 'toc-section';
      details.open = true;
      const summary = document.createElement('summary');
      details.appendChild(summary);
      const childUl = document.createElement('ul');
      details.appendChild(childUl);
      li.appendChild(details);
      stack.push({ ul: childUl, level: nextLevel });
    }
  });
}

// Floating TOC toggle
const tocToggle = document.getElementById('btn-toc-toggle');
if (tocToggle) {
  tocToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target.id !== 'btn-toc-toggle') {
      sidebar.classList.remove('open');
    }
  });
}

// ---- Theme ----
const DARK_THEMES = new Set(['dark', 'dracula', 'matrix', 'starwars']);

function setTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('visormd-theme', name);
  const isDark = DARK_THEMES.has(name);
  mermaid.initialize({ theme: isDark ? 'dark' : 'default' });
  const sel = document.getElementById('theme-selector');
  if (sel) sel.value = name;
}

const savedTheme = localStorage.getItem('visormd-theme');
setTheme(savedTheme || 'light');

// ---- Search ----
let searchMatches = [];
let searchIndex = -1;

function toggleSearch() {
  searchBar.style.display = searchBar.style.display === 'none' ? 'flex' : 'none';
  if (searchBar.style.display !== 'none') {
    searchInput.focus();
    searchInput.select();
  }
}

function hideSearch() {
  searchBar.style.display = 'none';
  clearHighlights();
}

function onSearchInput() {
  const query = searchInput.value.trim().toLowerCase();
  clearHighlights();
  if (!query) { searchCount.textContent = ''; return; }

  const contentDiv = getActiveContentDiv() || preview;
  const bodyText = contentDiv.innerText;
  searchMatches = [];
  const lower = bodyText.toLowerCase();

  const walker = document.createTreeWalker(contentDiv, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    const lowerNode = text.toLowerCase();
    let pos = 0;
    while ((pos = lowerNode.indexOf(query, pos)) !== -1) {
      searchMatches.push({ node, offset: pos, length: query.length });
      pos += query.length;
    }
  }

  searchIndex = searchMatches.length > 0 ? 0 : -1;
  updateSearchUI();
  highlightCurrent();
}

function clearHighlights() {
  const contentDiv = getActiveContentDiv() || preview;
  contentDiv.querySelectorAll('.search-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
  searchMatches = [];
  searchIndex = -1;
}

function highlightCurrent() {
  clearHighlights();
  if (!searchInput.value.trim()) return;
  const query = searchInput.value.trim();

  searchMatches.forEach((match, i) => {
    const range = document.createRange();
    range.setStart(match.node, match.offset);
    range.setEnd(match.node, match.offset + match.length);

    const span = document.createElement('span');
    span.className = 'search-highlight' + (i === searchIndex ? ' active' : '');
    span.textContent = query;
    range.deleteContents();
    range.insertNode(span);
  });

  if (searchIndex >= 0 && searchIndex < searchMatches.length) {
    const contentDiv = getActiveContentDiv() || preview;
    const active = contentDiv.querySelector('.search-highlight.active');
    active?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function searchMove(dir) {
  if (searchMatches.length === 0) return;
  searchIndex = (searchIndex + dir + searchMatches.length) % searchMatches.length;
  highlightCurrent();
  updateSearchUI();
}

function updateSearchUI() {
  if (searchMatches.length === 0) {
    searchCount.textContent = '0 resultados';
  } else {
    searchCount.textContent = `${searchIndex + 1} de ${searchMatches.length}`;
  }
}
