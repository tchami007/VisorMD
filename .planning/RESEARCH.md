# Research Técnico — VisorMD Fase 1

## Framework: PhotinoX

**Conclusión:** PhotinoX es la mejor opción para VisorMD.

| Aspecto | PhotinoX | MAUI Blazor Hybrid | WPF/WebView2 |
|---------|----------|-------------------|--------------|
| Cross-platform | Win/Mac/Linux | Win/Mac/Linux + mobile | Solo Windows |
| Peso | ~15-20MB | ~80-100MB | ~60MB+ |
| Dependencia WebView | Nativo SO | Nativo SO | WebView2 |
| .NET target | net8.0/9.0/10.0 | net8.0/9.0 | net8.0/9.0 |
| Madurez | Mantenido fork | Oficial Microsoft | Oficial Microsoft |

PhotinoX es un fork mantenido de Photino.NET con API estable y empaquetado NuGet.

## Frontend: HTML/CSS/JS vanilla

No se necesita framework pesado. El viewer se compone de:
- **markdown-it** + plugins (GFM tables, task lists, mermaid)
- **mermaid-it-markdown** plugin para markdown-it
- **highlight.js** para resaltado de código
- **KaTeX** (opcional, Fase 2)

El HTML se genera en el frontend dentro del WebView. El backend .NET sirve los archivos estáticos y expone API para:

| Operación | Método | Descripción |
|-----------|--------|-------------|
| `GET /` | Serve index.html | Carga la app |
| `POST /api/open` | Abre archivo | Lee `.md` del disco |
| `POST /api/save-config` | Guarda config | Persiste preferencias |
| `GET /api/listen` | SSE / polling | File change notifications |

## Integración markdown-it + Mermaid

```
npm install markdown-it @agoose77/markdown-it-mermaid mermaid highlight.js
```

```js
const md = require('markdown-it')();
md.use(require('@agoose77/markdown-it-mermaid'));
const result = md.render(markdownContent);
// Renderiza bloques ```mermaid como diagramas SVG
```

## Estructura de proyecto

```
VisorMD/
├── src/
│   ├── VisorMD.Backend/          # C# .NET project
│   │   ├── Program.cs            # Entry point, PhotinoX window
│   │   ├── FileService.cs        # Read .md files, FS watcher
│   │   └── wwwroot/              # Frontend assets
│   │       ├── index.html         # Shell layout
│   │       ├── style.css          # Tema claro/oscuro
│   │       ├── app.js             # markdown-it init, mermaid render
│   │       ├── toc.js             # TOC sidebar logic
│   │       └── search.js          # Ctrl+F logic
│   └── VisorMD.sln               # Solution file
├── docs/
└── .planning/
```

## Build cross-platform

```bash
dotnet publish -c Release -r win-x64   # Windows
dotnet publish -c Release -r osx-x64   # macOS Intel
dotnet publish -c Release -r osx-arm64 # macOS Apple Silicon
dotnet publish -c Release -r linux-x64 # Linux
```

## Referencias

- PhotinoX: https://github.com/ivanvoyager/PhotinoX
- Photino docs: https://docs.tryphotino.io
- markdown-it: https://github.com/markdown-it/markdown-it
- mermaid-it-markdown: https://www.npmjs.com/package/mermaid-it-markdown
- highlight.js: https://highlightjs.org
