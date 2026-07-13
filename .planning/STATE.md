---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Primer lanzamiento
status: complete
last_updated: "2026-07-13T15:30:00.000Z"
---

# STATE.md — VisorMD

**Última actualización:** 2026-07-13

## Estado actual

- ✅ **v1.0 shipped** — 3 fases completadas (MVP + Productividad + Madurez)
- Build self-contained win-x64 publicado en `dist/VisorMD/`

## Fase 1: MVP

- Solución .NET con PhotinoX
- Backend: Program.cs, FileService, FileWatcher
- Frontend: markdown-it + mermaid.js + highlight.js + KaTeX
- TOC lateral, tema claro/oscuro, búsqueda Ctrl+F
- Build scripts para Win/Mac/Linux

## Fase 2: Productividad

- Live reload automático (FileWatcher)
- Exportación PDF (Ctrl+P)
- KaTeX (fórmulas matemáticas)
- Pestañas múltiples — Ctrl+TAB, Ctrl+W, click medio cerrar
- Barra de progreso de lectura

## Fase 3: Madurez

- 8 temas visuales + selector UI + CLI `--theme`
- CLI `--help` / `-h` en español
- TOC jerárquico (h1-h4 con nesting)
- TOC flotante responsive (≤800px)
- Scripts instalación: install-mac.sh, install-linux.sh, install.ps1, setup.nsi
- Fix: cerrar pestaña con ×, Ctrl+O respeta última carpeta

## Quick Tasks Completed

| Date | Task |
|------|------|
| 2026-07-13 | fix-close-tab-lastdir — Cerrar pestaña con × + Ctrl+O última carpeta |
