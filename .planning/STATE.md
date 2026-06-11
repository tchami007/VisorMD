# STATE.md — VisorMD

**Última actualización:** 2026-06-10

## Estado actual
- ✅ Fase 1 (MVP) completada
- Próximo paso: Fase 2 (Productividad)

## Decisiones registradas
- Se eligió .NET + WebView sobre Rust/egui por perfil del equipo (C#)
- Se eligió WebView nativo sobre Electron por tamaño y rendimiento
- Se prioriza viewer-first (sin modo edición)
- Se usó PhotinoX como wrapper cross-platform de WebView

## Fase 1 completada
- Solución .NET 9 con PhotinoX
- Backend: Program.cs, FileService, FileWatcher
- Frontend: markdown-it + mermaid.js + highlight.js
- TOC lateral, tema claro/oscuro, búsqueda Ctrl+F
- Build scripts para Win/Mac/Linux

## Fase activa
- Ninguna (Fase 1 completada)
