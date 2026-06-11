# Investigación de Dominio: Visores Markdown

## Competencia

| Producto | Stack | Ventajas | Debilidades |
|----------|-------|----------|-------------|
| **mdr** | Rust + egui/webview/TUI | Binario único, 3 backends, Mermaid nativo | Sin Windows build oficial |
| **md-viewer** | Rust + egui | GFM completo, Mermaid vía merman | Solo Linux |
| **QuickMD** | Swift (macOS native) | Nativo, rápido, Mermaid | Solo macOS |
| **mdview.io** | Web | Sin instalación, Mermaid + LaTeX | Solo online |
| **Marked 3** | macOS native | Potente, personalizable | Solo macOS, pago |
| **Markdown Monster** | .NET + WebView | Windows, potente | Solo Windows |

## Diferenciación de VisorMD

- **Multiplataforma real** con un solo código base (.NET)
- **Equipo .NET** — mantenible por el equipo actual
- **Viewer-first puro** — no es editor, no tiene modo edición
- **Liviano** — sin Electron (< 30MB vs 150MB+)
- **Mermaid offline** — todo bundled, sin CDN

## Tecnologías Clave

### Mermaid.js
- Librería JS estándar para diagramas desde texto
- v11.15.0 actual, soporta: flowchart, sequence, class, state, ER, Gantt, pie, git, mindmap, timeline
- Renderiza a SVG
- Se integra directo en webview

### markdown-it
- Parser Markdown extensible vía plugins
- Plugins disponibles: GFM tables, task lists, container, footnote, emoji
- Rápido y modular

### WebView2 / WKWebView / WebKitGTK
- WebView2: Edge Chromium embedded, Windows 10+ (redistribuible para Win 7/8)
- WKWebView: Nativo macOS, moderno
- WebKitGTK: Linux, estándar
- Comunicación vía IPC con backend .NET
