# VisorMD

Visor de Markdown ligero, multiplataforma y sin dependencias pesadas. Construido con **.NET 9** + **PhotinoX** (ventana nativa sin Electron).

## Características

- **Rendering GFM** — Markdown con tablas, listas de tareas, footnotes, y más (via markdown-it)
- **Diagramas** — Soporte para Mermaid (flowcharts, sequence, gantt, etc.)
- **Matemáticas** — Renderizado LaTeX con KaTeX
- **Syntax highlighting** — Resaltado de código con highlight.js
- **8 temas visuales** — Claro, Oscuro, Sepia, Dracula, Alto contraste, Océano, Matrix, Star Wars
- **Pestañas múltiples** — Abre varios archivos simultáneamente
- **Live reload** — Detecta cambios en disco y recarga automáticamente
- **Búsqueda** — Busca texto dentro del documento (Ctrl+F)
- **Impresión / PDF** — Exporta a PDF desde el navegador (Ctrl+P)
- **Drag & drop** — Arrastra archivos .md a la ventana

## Requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- Node.js 18+ (solo para desarrollo del frontend)

## Compilar y ejecutar

```bash
# 1. Compilar el frontend (esbuild)
cd src/VisorMD/wwwroot
npm install
npm run build

# 2. Compilar y ejecutar la aplicación
cd ../../..
dotnet run --project src/VisorMD
```

Para abrir un archivo directamente:

```bash
dotnet run --project src/VisorMD -- ruta/archivo.md
```

Seleccionar tema desde CLI:

```bash
dotnet run --project src/VisorMD -- --theme dracula
dotnet run --project src/VisorMD -- --theme ocean documento.md
```

### Publicación AOT

```bash
dotnet publish src/VisorMD -c Release -r win-x64   # Windows
dotnet publish src/VisorMD -c Release -r osx-x64   # macOS
dotnet publish src/VisorMD -c Release -r linux-x64  # Linux
```

## Scripts de instalación

| Plataforma | Script |
|------------|--------|
| Windows    | `scripts/install.ps1` |
| macOS      | `scripts/build-mac.sh` |
| Linux      | `scripts/build-linux.sh` |

## Estructura del proyecto

```
src/
  VisorMD/
    Program.cs          — Punto de entrada y backend (.NET)
    FileService.cs      — Lectura de archivos
    FileWatcher.cs      — Watch de cambios en disco
    JsonMessages.cs     — Mensajes IPC backend ↔ frontend
    wwwroot/
      index.html        — Shell de la UI
      src/
        index.js        — Lógica del frontend
        styles.css      — Estilos y temas
      fonts/            — Fuentes KaTeX embebidas
      package.json      — Dependencias JS
      esbuild.config.mjs — Bundler config
scripts/
  build.ps1             — Build completo (frontend + .NET)
  build-win.bat         — Build Windows
  build-mac.sh          — Build macOS + .app bundle
  build-linux.sh        — Build Linux + desktop entry
  install.ps1           — Instalador Windows
  setup.nsi             — NSIS installer script
```

## Licencia

MIT
