# VisorMD — Requerimientos

## MVP (Fase 1)

### Funcionales
- RF1. Abrir archivos `.md` locales (doble clic, arrastrar, menú Archivo)
- RF2. Renderizar Markdown GFM (títulos, listas, tablas, code blocks, blockquotes, imágenes, enlaces)
- RF3. Renderizar diagramas Mermaid (flowchart, sequence, class, state, ER, Gantt, pie, git)
- RF4. Resaltado de sintaxis en bloques de código (highlight.js, 50+ lenguajes)
- RF5. Navegación por documento (scroll, TOC lateral con headings)
- RF6. Temas claro/oscuro
- RF7. Búsqueda en-documento (Ctrl+F)

### No Funcionales
- RNF1. Inicio en < 1 segundo
- RNF2. Binario < 50MB
- RNF3. Funcionar completamente offline
- RNF4. Soporte Windows, macOS, Linux

## Fase 2

### Funcionales
- RF8. Live reload ante cambios en el archivo (FileSystemWatcher)
- RF9. Exportar a PDF
- RF10. Soporte multiventana/pestañas
- RF11. KaTeX para fórmulas matemáticas
- RF12. Barra de progreso de lectura

## Fase 3

### Funcionales
- RF13. CLI: `visormd file.md` desde terminal
- RF14. Temas personalizados (JSON de colores)
- RF15. Tabla de contenidos flotante
- RF16. Mapa del documento (vista general de estructura)
- RF17. Asociación de archivos `.md` en el SO
