# Phase 3 - Madurez: Temas Personalizados

## Wave 1: Temas pre-armados + Selector UI + CLI

### Goal
Agregar 6 temas nuevos (Sepia, Dracula, Alto Contraste, Océano, Matrix, Star Wars) además de Claro/Oscuro existentes. Selector de temas en UI. Soporte `--theme <nombre>` en CLI.

### Files Modified
- `src/VisorMD/wwwroot/src/styles.css` — CSS variables para cada tema
- `src/VisorMD/wwwroot/src/index.js` — Selector UI, persistencia, sync Mermaid/highlight.js
- `src/VisorMD/Program.cs` — CLI `--theme` acepta cualquier tema

### Verification
- `styles.css` tiene `[data-theme="..."]` para los 8 temas
- index.js tiene un dropdown de temas que persiste en localStorage
- `--theme sepia` desde CLI abre con tema sepia
- Mermaid usa tema oscuro para dark/dracula/matrix/starwars
- Build compila sin errores

---

## Tasks

### Task 1: CSS variables para los 6 temas nuevos

**Read first:**
- `src/VisorMD/wwwroot/src/styles.css` (ver estructura actual de `:root` y `[data-theme="dark"]`)

**Action:**
Agregar 6 bloques `[data-theme="..."]` en styles.css con las siguientes paletas:

**Sepia** (`[data-theme="sepia"]`):
- `--bg: #fbf0d9`
- `--bg-secondary: #efe5cc`
- `--bg-tertiary: #e0d4ba`
- `--text: #5b4636`
- `--text-secondary: #8a7b6b`
- `--border: #d4c5a9`
- `--accent: #8b4513`
- `--accent-hover: #a0522d`
- `--code-bg: #f5ead0`
- Layout/font variables igual que `:root`

**Dracula** (`[data-theme="dracula"]`):
- `--bg: #282a36`
- `--bg-secondary: #2c2e3e`
- `--bg-tertiary: #3c3e4e`
- `--text: #f8f8f2`
- `--text-secondary: #8888aa`
- `--border: #44475a`
- `--accent: #bd93f9`
- `--accent-hover: #caa9fa`
- `--code-bg: #21222c`

**Alto Contraste** (`[data-theme="highcontrast"]`):
- `--bg: #ffffff`
- `--bg-secondary: #ffffff`
- `--bg-tertiary: #f0f0f0`
- `--text: #000000`
- `--text-secondary: #333333`
- `--border: #000000`
- `--accent: #0000ff`
- `--accent-hover: #0000cc`
- `--code-bg: #f0f0f0`

**Océano** (`[data-theme="ocean"]`):
- `--bg: #eef5ff`
- `--bg-secondary: #dde8f5`
- `--bg-tertiary: #cce0f5`
- `--text: #1a365d`
- `--text-secondary: #4a6a8a`
- `--border: #b0c4de`
- `--accent: #1e6bb8`
- `--accent-hover: #1558a0`
- `--code-bg: #f0f7ff`

**Matrix** (`[data-theme="matrix"]`):
- `--bg: #000000`
- `--bg-secondary: #0a0a0a`
- `--bg-tertiary: #1a1a1a`
- `--text: #00ff41`
- `--text-secondary: #00cc33`
- `--border: #003300`
- `--accent: #00ff41`
- `--accent-hover: #33ff66`
- `--code-bg: #0d0d0d`

**Star Wars** (`[data-theme="starwars"]`):
- `--bg: #0d0d1a`
- `--bg-secondary: #1a1a2e`
- `--bg-tertiary: #2a2a3e`
- `--text: #ffd700`
- `--text-secondary: #c0a000`
- `--border: #333355`
- `--accent: #ffd700`
- `--accent-hover: #ffe44d`
- `--code-bg: #1a1a2e`

**Acceptance criteria:**
- `styles.css` contiene 8 bloques `[data-theme="..."]` total
- Cada bloque define al menos las 9 variables de color (`--bg`, `--bg-secondary`, `--bg-tertiary`, `--text`, `--text-secondary`, `--border`, `--accent`, `--accent-hover`, `--code-bg`)
- Ningún bloque define layout/font variables (heredan de `:root`)
- Archivo existe y es CSS válido

---

### Task 2: Selector de temas en UI

**Read first:**
- `src/VisorMD/wwwroot/src/index.js` (función `toggleTheme`, persistencia, sección `// ---- Theme ----`)
- `src/VisorMD/wwwroot/index.html` (estructura del header)

**Action:**

1. Reemplazar el botón `#btn-theme` (🌓) con un `<select id="theme-selector">` que liste los 8 temas:

```html
<select id="theme-selector">
  <option value="light">Claro</option>
  <option value="dark">Oscuro</option>
  <option value="sepia">Sepia</option>
  <option value="dracula">Dracula</option>
  <option value="highcontrast">Alto contraste</option>
  <option value="ocean">Océano</option>
  <option value="matrix">Matrix</option>
  <option value="starwars">Star Wars</option>
</select>
```

2. Reemplazar `toggleTheme()` con `setTheme(name)`:
```javascript
function setTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('visormd-theme', name);
  const isDark = name === 'dark' || name === 'dracula' || name === 'matrix' || name === 'starwars';
  mermaid.initialize({ theme: isDark ? 'dark' : 'default' });
  document.getElementById('theme-selector').value = name;
}
```

3. En lugar del event listener de `#btn-theme`, agregar `change` event listener en `#theme-selector` que llama `setTheme(newValue)`.

4. En la carga inicial, después de restaurar el tema guardado de localStorage, sincronizar el `<select>`:
```javascript
const savedTheme = localStorage.getItem('visormd-theme') || 'light';
setTheme(savedTheme);
```

5. Reemplazar la sección de `// ---- Theme ----` completa.

6. Ajustar CSS para que el selector se vea bien en el header (opcional: darle estilo inline).

**Acceptance criteria:**
- `<select>` aparece en el header en lugar del botón 🌓
- Cambiar el `<select>` aplica el tema inmediatamente
- El tema persiste al recargar
- `setTheme('matrix')` pone Mermaid en modo dark
- `setTheme('sepia')` pone Mermaid en modo default
- `index.js` no contiene referencias a `toggleTheme` ni `#btn-theme`

---

### Task 3: Soporte CLI `--theme <nombre>`

**Read first:**
- `src/VisorMD/Program.cs` (sección de argumentos `--theme`)
- `src/VisorMD/Messages.cs` (clase `SetThemeMessage`)
- `src/VisorMD/wwwroot/src/index.js` (handler `app-ready` para `set-theme`)

**Action:**

1. En `Program.cs`, validar que `s_pendingTheme` sea uno de los 8 valores válidos: `light`, `dark`, `sepia`, `dracula`, `highcontrast`, `ocean`, `matrix`, `starwars`. Si no es válido, mostrar error y salir.

2. Asegurarse de que `SetThemeMessage { Theme = s_pendingTheme }` se serializa correctamente y el frontend lo recibe.

3. En el frontend, en el handler `app-ready` del mensaje `set-theme`, llamar `setTheme(theme)` en lugar de `toggleTheme()`.

**Acceptance criteria:**
- `visormd --theme matrix doc.md` abre con tema Matrix
- `visormd --theme sepia` abre con tema Sepia
- `visormd --theme inexistente doc.md` muestra error
- `visormd doc.md` abre con tema guardado en localStorage
- `--theme` sin argumento muestra error

---

### Task 4: Ajustes finales

**Read first:**
- `src/VisorMD/wwwroot/src/index.js`
- `src/VisorMD/wwwroot/src/styles.css`

**Action:**

1. Asegurar que Highlight.js funcione bien con todos los temas (usa clases propias, debería andar sin cambios).
2. Verificar que `.search-highlight` en oscuro/dracula/matrix/starwars tenga contraste suficiente.
3. En `styles.css`, agregar override para `.search-highlight` en temas oscuros si es necesario.
4. Rebuild del frontend con esbuild.

**Acceptance criteria:**
- Todos los temas se ven correctamente
- Highlight.js tiene colores legibles
- Los search highlights son visibles en todos los temas
- `npm run build` o `esbuild` compila sin errores
