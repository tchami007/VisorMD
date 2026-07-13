# VisorMD — Roadmap

## ✅ Fase 1: MVP (Fundación) — COMPLETADA
**Objetivo:** Visor funcional cross-platform con GFM + Mermaid

- [x] Estructura del proyecto .NET + WebView
- [x] Ventana principal con WebView embebido
- [x] Backend: apertura de archivos, file watcher básico
- [x] Frontend: markdown-it + mermaid.js + highlight.js
- [x] Tema claro/oscuro
- [x] TOC lateral
- [x] Búsqueda en-documento
- [x] Build para Win, Mac, Linux
- [x] Pruebas de humo

## ✅ Fase 2: Productividad — COMPLETADA
**Objetivo:** Experiencia pulida para uso diario

- [x] Live reload automático (FileWatcher)
- [x] Exportación PDF (Ctrl+P / botón imprimir)
- [x] KaTeX (fórmulas matemáticas `$...$` y `$$...$$`)
- [x] Pestañas múltiples (Ctrl+TAB, Ctrl+W, click medio cerrar)
- [x] Barra de progreso de lectura

## Fase 3: Madurez (EN PROGRESO)
**Objetivo:** Herramienta completa para el ecosistema

- [x] Temas personalizados — 8 temas (Claro, Oscuro, Sepia, Dracula, Alto Contraste, Océano, Matrix, Star Wars) + selector UI + CLI `--theme`
- [ ] CLI completo (`--help`, `--print`, file association)
- [ ] Tabla de contenidos flotante
- [ ] Mapa del documento
- [x] Instalador (PowerShell + script NSIS) — `scripts/install.ps1` (sin dependencias) + `scripts/setup.nsi` (requiere NSIS) + `scripts/build.ps1`
