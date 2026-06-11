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
document.getElementById('btn-theme').addEventListener('click', toggleTheme);
document.getElementById('btn-search').addEventListener('click', toggleSearch);
document.getElementById('btn-open').addEventListener('click', () => sendToBackend({ type: 'show-open-dialog' }));
document.getElementById('btn-print').addEventListener('click', printContent);
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

// IPC
function handleBackendMessage(data) {
  switch (data.type) {
    case 'file-loaded':
      renderContent(data.content, data.fileName, data.filePath);
      break;
    case 'file-changed':
      renderContent(data.content, data.fileName || '', data.filePath || '');
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
  const content = document.getElementById('preview').innerHTML;
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
  reader.onload = (e) => renderContent(e.target.result, file.name, '');
  reader.readAsText(file);
}

function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => renderContent(ev.target.result, file.name, '');
  reader.readAsText(file);
  e.target.value = '';
}

function renderContent(content, name, filePath) {
  welcome.style.display = 'none';
  preview.style.display = 'block';
  document.title = `VisorMD - ${name || ''}`;

  const html = md.render(content || '');
  preview.innerHTML = html;

  const mermaidBlocks = preview.querySelectorAll('pre code.language-mermaid');
  mermaidBlocks.forEach((block) => {
    const pre = block.parentElement;
    const code = block.textContent;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code;
    pre.replaceWith(div);
  });

  if (mermaidBlocks.length > 0) {
    mermaid.run({ nodes: preview.querySelectorAll('.mermaid') }).catch(console.error);
  }

  buildToc();
  updateThemeInMermaid();
}

// ---- TOC ----
function buildToc() {
  toc.innerHTML = '';
  const headings = preview.querySelectorAll('h1, h2, h3, h4');
  headings.forEach((h) => {
    const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    h.id = id;
    const a = document.createElement('a');
    a.className = `toc-item toc-${h.tagName.toLowerCase()}`;
    a.textContent = h.textContent;
    a.href = `#${id}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
      toc.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
    });
    toc.appendChild(a);
  });
}

// ---- Theme ----
function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('visormd-theme', newTheme);
  updateThemeInMermaid();
}

function updateThemeInMermaid() {
  const theme = document.documentElement.getAttribute('data-theme');
  mermaid.initialize({ theme: theme === 'dark' ? 'dark' : 'default' });
}

const savedTheme = localStorage.getItem('visormd-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

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

  const bodyText = preview.innerText;
  searchMatches = [];
  const lower = bodyText.toLowerCase();
  let idx = -1;

  const walker = document.createTreeWalker(preview, NodeFilter.SHOW_TEXT);
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
  preview.querySelectorAll('.search-highlight').forEach(el => {
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
    const active = preview.querySelector('.search-highlight.active');
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
