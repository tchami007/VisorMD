# VisorMD

**Visor liviano de documentos Markdown con soporte para extensiones y diagramas Mermaid.**

## Problema

Los desarrolladores y equipos técnicos necesitan visualizar documentos Markdown (generados por IA, documentación técnica, especificaciones) que incluyen diagramas Mermaid, tablas, fórmulas y otras extensiones. Las herramientas existentes son pesadas (Electron), específicas de un SO, o requieren un editor en lugar de un visor dedicado.

## Propuesta

VisorMD es una aplicación desktop cross-platform (Windows, macOS, Linux) construida con .NET + WebView nativo que permite abrir archivos `.md` y renderizarlos al instante con soporte completo de GFM y Mermaid, sin la sobrecarga de un navegador completo.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | .NET (C#) |
| UI | WebView nativo (WebView2 / WKWebView / WebKitGTK) |
| Renderizado MD | markdown-it |
| Diagramas | mermaid.js |
| Resaltado código | highlight.js |
| Cross-platform | Win (WebView2), Mac (WKWebView), Linux (WebKitGTK) |

## Principios

- **Viewer-first:** Abrir y leer al instante, sin modo edición
- **Liviano:** Sin Electron, binario pequeño (~20-30MB)
- **Offline:** Sin dependencias de CDN, todo bundled
- **Extensiones:** Mermaid, LaTeX (KaTeX), tablas GFM, task lists
