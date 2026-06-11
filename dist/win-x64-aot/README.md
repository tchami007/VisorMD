# VisorMD

Visor de Markdown con Mermaid, KaTeX, TOC y pestañas — compilado nativamente (Native AOT).

No requiere .NET Runtime. Solo WebView2 Runtime (incluido en Windows 11).

## Archivos

- `VisorMD.exe` (ejecutable único)
- `PhotinoX.Native.dll`
- `WebView2Loader.dll`

Los assets (HTML, JS, CSS, fuentes KaTeX) están embebidos en el ejecutable y se extraen automáticamente a `%TEMP%\VisorMD\wwwroot\` al primer inicio.

## Uso

- `VisorMD.exe` — abre la interfaz con panel de bienvenida
- `VisorMD.exe ruta\archivo.md` — abre directamente un archivo
- Arrastrar `.md` a la ventana
- Ctrl+O / 📂 — abrir archivo
- Ctrl+F / 🔍 — buscar en el documento
- 🖨️ — exportar a PDF (abre diálogo Guardar como PDF)
- 🌓 — cambiar tema claro/oscuro

## Funcionalidades

- Markdown GFM (tablas, listas, tareas, notas al pie)
- Diagramas Mermaid (flowcharts, sequence, gantt, etc.)
- Fórmulas KaTeX ($\LaTeX$ inline con `$...$`, bloque con `$$...$$`)
- Resaltado de sintaxis (highlight.js)
- TOC lateral interactivo
- Pestañas múltiples (arrastra varios .md)
- Barra de progreso de lectura
- Búsqueda en vivo con navegación

## Requisitos

- Windows 10/11 64-bit
- WebView2 Runtime (incluido en Win11, descargar en Win10 desde https://developer.microsoft.com/microsoft-edge/webview2/)
