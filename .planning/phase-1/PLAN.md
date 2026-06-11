# PLAN.md — Fase 1: MVP (Fundación)

**Objetivo:** Visor funcional cross-platform con GFM + Mermaid.

**Stack:** .NET + PhotinoX + markdown-it + mermaid.js + highlight.js

---

## Wave 1: Esqueleto del proyecto

### 1.1 Inicializar solución .NET

- Crear solución `VisorMD.sln` con proyecto `VisorMD` (console app)
- `dotnet add package PhotinoX`
- Crear estructura `wwwroot/` para assets frontend
- Verificar build en `win-x64`

**DoD:** `dotnet build` exitoso, ventana PhotinoX vacía se abre en Windows.

### 1.2 Integrar PhotinoX + ventana base

- `Program.cs`: crear ventana con título "VisorMD", tamaño 1024x768
- Cargar `index.html` desde `wwwroot/`
- Configurar NativeWindow para que acepte drag-and-drop de archivos
- Soporte para argumento CLI: `VisorMD.exe archivo.md`

**DoD:** Ventana nativa con HTML renderizado. Al arrastrar un `.md` se detecta.

---

## Wave 2: Backend — Servicios .NET

### 2.1 FileService

- `FileService.cs`: leer archivo `.md` del disco, devolver string
- `GetFileInfo()`: nombre, ruta, tamaño, última modificación
- Manejo de encoding (UTF-8 con BOM, UTF-16)

### 2.2 FileWatcher

- `FileWatcher.cs`: FileSystemWatcher para live reload (preparar para Fase 2)
- Evento `OnFileChanged` → notifica al frontend vía callback

### 2.3 IPC Bridge

- Comunicación .NET ↔ WebView
- `SendToWebview(message)`: inyecta JS en el WebView
- `ReceiveFromWebview(action)`: callbacks desde JS a .NET
- Mensajes: `{ type: "open-file", path: "..." }`, `{ type: "file-content", content: "..." }`

**DoD:** Desde JS se puede invocar `openFile("test.md")` y recibir el contenido.

---

## Wave 3: Frontend — Renderizado Markdown

### 3.1 Setup npm

- `package.json` en `wwwroot/` (o bundle manual)
- Dependencias: `markdown-it`, `@agoose77/markdown-it-mermaid`, `mermaid`, `highlight.js`
- Bundle con esbuild o similar (inline en HTML para simplificar)

### 3.2 markdown-it + GFM

- Inicializar markdown-it con plugins:
  - `markdown-it-gfm-tables`
  - `markdown-it-task-lists`
  - `markdown-it-footnote`
- Renderizar contenido en `#preview` div
- Manejo seguro de HTML (sanitize opcional)

### 3.3 Mermaid

- Hook en markdown-it para transformar ` ```mermaid ` blocks
- Llamar `mermaid.run()` post-render para convertir a SVG
- Manejar zoom/pan en diagramas

### 3.4 highlight.js

- Auto-detect lenguaje en code fences
- Aplicar tema de sintaxis
- Enlace con tema claro/oscuro

**DoD:** Un `.md` con GFM tables, task lists, code blocks y Mermaid se renderiza correctamente.

---

## Wave 4: UI — Navegación y temas

### 4.1 Layout base

- Header: nombre del archivo actual
- Sidebar izquierdo: TOC con headings (`h1`–`h4`) extraídos del HTML renderizado
- Área principal: contenido renderizado con scroll
- Scroll syncing entre TOC y contenido

### 4.2 Tema claro/oscuro

- CSS custom properties para colores
- Botón toggle en header
- Persistir preferencia en localStorage
- Dos temas completos:
  - Claro: fondo blanco, texto oscuro
  - Oscuro: fondo #1e1e1e, texto #d4d4d4

### 4.3 Drag & Drop

- Escuchar eventos `dragover`/`drop` en la ventana
- Extraer ruta del archivo soltado
- Llamar `openFile()` con la ruta

### 4.4 Búsqueda en-documento (Ctrl+F)

- Input de búsqueda (toggle con Ctrl+F)
- Highlight matches en el contenido
- Navegación entre resultados (Enter/Shift+Enter)
- Contador "1 de 15"

**DoD:** Usuario puede abrir archivo, ver TOC, cambiar tema, buscar texto.

---

## Wave 5: Build cross-platform y distribución

### 5.1 Build scripts

- Scripts por plataforma en `/scripts/`
- `build-win.bat`, `build-mac.sh`, `build-linux.sh`
- Publicación self-contained con `dotnet publish -c Release -r <rid> --self-contained`

### 5.2 Prueba en cada plataforma

- Probar en Windows 10/11
- Probar en macOS (Intel + Apple Silicon)
- Probar en Linux (Ubuntu 22.04+, Fedora)

### 5.3 Smoke tests

- Abrir archivo `.md` pequeño (<1KB)
- Abrir archivo `.md` grande (>1MB)
- Renderizar con diagramas Mermaid
- Cambiar tema claro ↔ oscuro
- Buscar texto existente y no existente
- Arrastrar archivo a la ventana

**DoD:** Binarios publicados para las 3 plataformas. Smoke tests pasan.

---

## Criterios de aceptación (UAT)

| # | Criterio | Wave |
|---|----------|------|
| UAT1 | Ventana nativa se abre y carga HTML | W1 |
| UAT2 | Se abre archivo `.md` desde menú Archivo o CLI | W2 |
| UAT3 | Markdown GFM se renderiza (tablas, lists, code) | W3 |
| UAT4 | Diagramas Mermaid se renderizan como SVG interactivo | W3 |
| UAT5 | TOC lateral se genera automáticamente | W4 |
| UAT6 | Tema claro/oscuro funciona y persiste | W4 |
| UAT7 | Ctrl+F busca y resalta texto | W4 |
| UAT8 | App funciona offline (sin CDN) | W3 |
| UAT9 | Inicio < 1 segundo | W1 |
| UAT10 | Binario < 50MB | W5 |

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| WebView2 no instalado en Windows | Incluir Evergreen Bootstrapper en installer |
| WKWebView requiere macOS 10.13+ | Documentar requisitos mínimos |
| WebKitGTK no presente en Linux | Documentar `sudo apt install webkit2gtk-4.1` |
| Mermaid no se renderiza offline | Bundle completo de mermaid.js en `wwwroot/` |
| Archivos muy grandes (>10MB) | Lazy rendering con chunking (pospuesto a Fase 3) |
