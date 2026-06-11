# Phase 3: Madurez — Plan de Ejecución

**Objetivo:** Transformar VisorMD en una herramienta completa para el ecosistema, integrable con el SO y personalizable.

## Estructura de Waves

### Wave 1: CLI (Interfaz de línea de comandos)

**Archivos a modificar:**
- `src/VisorMD/Program.cs`
- `src/VisorMD/VisorMD.csproj` (opcional: dotnet tool manifest)

**Tareas:**
1. Soportar `visormd [opciones] <archivo.md>` con flags:
   - `--theme <claro|oscuro>` — abrir con tema específico
   - `--print` — abrir y mostrar diálogo de impresión
   - `--help` / `-h` — mostrar ayuda
2. Parsear argumentos con `System.CommandLine` o manual (sin dependencias extra)
3. Manejar error si archivo no existe (mensaje + exit code 1)
4. Documentar en `--help`

**Criterios de aceptación:**
- `visormd --help` muestra uso correcto
- `visormd archivo.md` abre y renderiza el archivo
- `visormd --theme dark archivo.md` abre en modo oscuro
- `visormd no-existe.md` muestra error y exit code 1

---

### Wave 2: Temas personalizados (JSON)

**Archivos a modificar:**
- `src/VisorMD/wwwroot/src/index.js`
- `src/VisorMD/wwwroot/src/styles.css`
- `src/VisorMD/Messages.cs` (nuevo mensaje IPC)
- `src/VisorMD/Program.cs` (persistencia de config)
- `src/VisorMD/wwwroot/index.html`

**Tareas:**

1. **Formato de tema JSON:**
   ```json
   {
     "name": "Dracula",
     "bg": "#282a36",
     "bgSecondary": "#44475a",
     "text": "#f8f8f2",
     "textSecondary": "#6272a4",
     "border": "#44475a",
     "accent": "#bd93f9",
     "accentHover": "#caa9fa",
     "codeBg": "#44475a"
   }
   ```

2. **Backend:**
   - Guardar tema activo en `%APPDATA%/VisorMD/config.json`
   - Cargar tema al iniciar
   - Enviar tema al frontend via IPC (`config-loaded`)
   - Mensaje `set-config` para persistir cambios desde frontend

3. **Frontend:**
   - Cargar tema desde el backend al iniciar
   - Aplicar variables CSS desde el objeto de tema
   - Selector de temas en UI (menú desplegable con Built-in + Personalizados)
   - Botón "Importar tema" que lee un archivo `.json`
   - Soporte para múltiples temas guardados

4. **Tema por defecto preservado:**
   - Claro y oscuro siguen siendo los built-in
   - Temas personalizados se añaden a la lista sin reemplazar los built-in

**Criterios de aceptación:**
- Se puede cargar un tema desde archivo JSON
- Las variables CSS se actualizan en vivo
- El tema persiste entre reinicios
- Los built-in claro/oscuro siguen funcionando

---

### Wave 3: Tabla de contenidos flotante

**Archivos a modificar:**
- `src/VisorMD/wwwroot/src/index.js`
- `src/VisorMD/wwwroot/src/styles.css`
- `src/VisorMD/wwwroot/index.html`

**Tareas:**
1. Botón flotante (⊕) en la esquina inferior derecha del contenido
2. Al hacer clic, overlay del TOC sobre el contenido (no reemplaza el sidebar)
3. El TOC flotante tiene:
   - Fondo semitransparente (blur)
   - Cierra al hacer clic fuera o presionar Escape
   - Misma jerarquía que el TOC lateral (h1-h4)
   - Scroll si es muy largo
4. El TOC lateral (sidebar) sigue existiendo — el flotante es adicional

**Criterios de aceptación:**
- Botón flotante visible cuando hay contenido cargado
- Overlay del TOC animado (fade + slide)
- Click fuera cierra el overlay
- Escape cierra el overlay

---

### Wave 4: Mapa del documento (Outline)

**Archivos a modificar:**
- `src/VisorMD/wwwroot/src/index.js`
- `src/VisorMD/wwwroot/src/styles.css`
- `src/VisorMD/wwwroot/index.html`

**Tareas:**
1. Vista "Outline" que muestra TODOS los headings del documento en una estructura de árbol
2. Ubicación: botón en la cabecera que alterna entre TOC normal y Outline
3. Cada heading muestra:
   - Icono de jerarquía (H1=documento, H2=sección, H3=subsección)
   - Número de línea o posición aproximada
   - Click para navegar
4. Colapsable/expandible por nivel

**Criterios de aceptación:**
- Muestra la jerarquía completa del documento
- Los items son clickeables y navegan suavemente
- Interfaz limpia y consistente con el TOC existente

---

### Wave 5: File association / Instalador

**Archivos a modificar:**
- `scripts/installer.nsi` (NSIS script)
- `src/VisorMD/VisorMD.csproj` (platform-specific publish targets)
- `README.md` o docs de instalación

**Tareas:**
1. **Windows (.reg / NSIS):**
   - Crear script NSIS para instalador
   - Asociar `.md` a VisorMD.exe
   - Registrar `VisorMD.md` en `HKEY_CLASSES_ROOT`
   - Añadir al menú contextual "Abrir con VisorMD"

2. **Archivo de instalación:**
   - Copiar `VisorMD.exe` a `%LOCALAPPDATA%\VisorMD\`
   - Crear acceso directo en menú inicio
   - Opción de añadir al PATH

3. **Registro del protocolo `visormd://`:**
   - Opcional: `visormd://open?path=...` para integración con otras herramientas

**Criterios de aceptación:**
- Doble clic en `.md` abre VisorMD con el archivo
- Menú contextual "Abrir con VisorMD" presente
- Desinstalador remueve todas las asociaciones
- La app está en el PATH

---

## Dependencias entre Waves

```
Wave 1 (CLI) ──► independiente
Wave 2 (Temas) ──► independiente
Wave 3 (TOC flotante) ──► independiente
Wave 4 (Mapa doc) ──► independiente
Wave 5 (Instalador) ──► necesita Wave 1 (CLI) completa
```

Waves 1-4 son independientes y pueden ejecutarse en paralelo.
Wave 5 depende de tener el .exe final y CLI funcionando.

## Tiempo estimado por Wave

| Wave | Componentes | Estimado |
|------|-------------|----------|
| 1 | CLI | 2-3h |
| 2 | Temas personalizados | 4-6h |
| 3 | TOC flotante | 2-3h |
| 4 | Mapa del documento | 3-4h |
| 5 | Instalador | 2-3h |

## Riesgos

1. **Temas personalizados:** La inyección de variables CSS en vivo puede tener problemas de especificidad. Usar `document.documentElement.style.setProperty()` para cada variable.
2. **Mapa del documento:** Documentos muy grandes (>100 headings) pueden tener problemas de rendimiento. Limitar a primeros 200 headings.
3. **Instalador:** Windows requiere firma de código o mostrará advertencia de SmartScreen.
