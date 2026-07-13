# Phase 3: Madurez — PLAN.md

**Generated:** 2026-07-13
**Covers:** RF13 (CLI --help), RF15 (TOC flotante), RF16 (Mapa del documento), RF17 (File association)

---

## must_haves

These are the non-negotiable outcomes that prove Phase 3 is complete:

1. D-02: Only `--help` flag added. No `--version`, no `--print` CLI flag. D-03: `--help` output is Spanish and concise. `visormd --help` prints Spanish help and exits cleanly (RF13)
2. D-05: Sidebar TOC shows heading hierarchy (h1-h4) with nesting/indentation. Not a separate panel (RF16)
3. Floating button appears on narrow screens, toggles sidebar as overlay (RF15)
4. macOS and Linux have install scripts that register `.md` file association (RF17)
5. D-01: FreeConsole() behavior unchanged — app always opens as GUI window. D-04: Existing `--theme` and positional arg unchanged. `--print` remains Ctrl+P only, no `--version`

---

## Artifacts this phase produces

| Artifact | Type | Location |
|----------|------|----------|
| `--help` CLI flag handler | Modified | `src/VisorMD/Program.cs` (new `case "--help"` / `case "-h"`) |
| `install-mac.sh` | Created | `scripts/install-mac.sh` |
| `install-linux.sh` | Created | `scripts/install-linux.sh` |
| Hierarchical `buildToc()` | Modified | `src/VisorMD/wwwroot/src/index.js` (rewritten `buildToc`) |
| `.toc-tree` / `.toc-section` CSS | Modified | `src/VisorMD/wwwroot/src/styles.css` (new tree classes) |
| `#btn-toc-toggle` button | Modified | `src/VisorMD/wwwroot/index.html` (new button) |
| Floating TOC toggle handler | Modified | `src/VisorMD/wwwroot/src/index.js` (click handler) |
| `#sidebar.open` / `#btn-toc-toggle` CSS | Modified | `src/VisorMD/wwwroot/src/styles.css` (overlay + button styles) |

---

## Wave 1: Temas Personalizados ✅ DELIVERED

**Status:** Complete. No tasks needed.

8 themes implemented (light, dark, sepia, dracula, highcontrast, ocean, matrix, starwars) with `<select>` UI, `--theme` CLI, and localStorage persistence. See `.planning/phases/phase-3/SUMMARY.md` for full details.

---

## Wave 2: CLI `--help` + File Association

- **depends_on:** Wave 1
- **files_modified:** `src/VisorMD/Program.cs` (edit), `scripts/install-mac.sh` (create), `scripts/install-linux.sh` (create)
- **autonomous:** true
- **parallel_with:** Wave 3

### Task 2.1: Add `--help` / `-h` flag to Program.cs (D-02, D-03)

<task>
<read_first>src/VisorMD/Program.cs</read_first>

<action>
Per D-02 (only --help flag, no --version, no --print CLI flag) and D-03 (Spanish concise output):
Locate the argument parser `for` loop with `switch` on `args[i]`. Add a `case "--help":` and `case "-h":` before the `default:` branch, and crucially **before** the `FreeConsole()` call (currently around line 83). Print the following Spanish text to the console:

```
VisorMD — Visor de archivos Markdown
Uso: visormd [opciones] [archivo]

Opciones:
  --theme <tema>    Tema visual (light, dark, sepia, dracula, highcontrast, ocean, matrix, starwars)
  --help, -h        Muestra esta ayuda

Ejemplos:
  visormd documento.md
  visormd --theme dracula guia.md
```

Then call `Environment.Exit(0); break;`.

Key implementation details:
- Use `Console.WriteLine(@"...")` with a verbatim string literal for multi-line output
- The `case "--help":` and `case "-h":` must **both** fall through to the same code
- Use `Environment.Exit(0)` not `return` — this is a top-level statement file
- Place it before `FreeConsole()` so the console is still available for output when launched from a terminal
- On Windows double-click (no console parent), output goes nowhere — this is acceptable per D-01
</action>

<acceptance_criteria>
- `visormd --help` prints Spanish help text and exits with code 0
- `visormd -h` works identically
- `visormd --help somefile.md` shows help (ignores file arg) and exits
- `visormd --help --theme blah` shows help and exits
- `visormd doc.md` (no --help) opens the window normally — `FreeConsole()` still runs
- `dotnet build` compiles with zero warnings
</acceptance_criteria>
</task>

### Task 2.2: Create install-mac.sh for macOS file association (D-01)

<task>
<read_first>scripts/install.ps1</read_first>

<action>
Per D-01 (keep FreeConsole, always GUI window):

Create a new file `scripts/install-mac.sh` that registers VisorMD as the default handler for `.md` and `.markdown` files on macOS.

<task>
<read_first>scripts/install.ps1</read_first>

<action>
Create a new file `scripts/install-mac.sh` that registers VisorMD as the default handler for `.md` and `.markdown` files on macOS.

The script must:
1. Check if VisorMD.app exists at `/Applications/VisorMD.app` — if not, print a warning and exit
2. Create a minimal plist declaration for the UTI if not already present in the app bundle's Info.plist
3. Register the app with LaunchServices via `lsregister`
4. Be idempotent — can be run multiple times safely

```bash
#!/bin/bash
APP_PATH="/Applications/VisorMD.app"
PLIST="$APP_PATH/Contents/Info.plist"

if [ ! -d "$APP_PATH" ]; then
  echo "Error: VisorMD.app not found at $APP_PATH"
  echo "Install VisorMD to /Applications first."
  exit 1
fi

# 1. Declare document types in Info.plist (idempotent — repeats overwrite same keys)
if [ -f "$PLIST" ]; then
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeName string 'Markdown File'" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeRole string 'Viewer'" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSHandlerRank string 'Default'" "$PLIST" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSItemContentTypes:0 string 'net.daringfireball.markdown'" "$PLIST" 2>/dev/null || true
fi

# 2. Force re-register with LaunchServices
SYSTEM_LS="/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister"
if [ -f "$SYSTEM_LS" ]; then
  "$SYSTEM_LS" -f "$APP_PATH"
  echo "VisorMD registered for .md and .markdown files."
else
  echo "Warning: lsregister not found. macOS version may not support this."
  echo "Manual registration may be required."
fi
```

Make the script executable with `chmod +x install-mac.sh`.
</action>

<acceptance_criteria>
- `scripts/install-mac.sh` exists and is executable
- Script does not error when VisorMD.app is not installed (prints warning)
- Script registers with lsregister for both `.md` and `.markdown` types
- Script is idempotent — running it twice produces same result
- ShellCheck passes (no lint errors)
</acceptance_criteria>
</task>

### Task 2.3: Create install-linux.sh for Linux file association

<task>
<read_first>scripts/install.ps1</read_first>

<action>
Create a new file `scripts/install-linux.sh` that registers VisorMD as the default handler for `.md` and `.markdown` files on Linux via `xdg-mime` and `.desktop` file.

The script must:
1. Create `~/.local/share/applications/visormd.desktop` with MimeType registration
2. Create `~/.local/share/mime/packages/visormd.xml` for MIME type
3. Run `update-desktop-database` and `update-mime-database`
4. Optionally set VisorMD as the default for text/markdown (with `xdg-mime default`)
5. Be idempotent

```bash
#!/bin/bash
set -e

APP_PATH="${1:-/usr/local/bin/visormd}"

# .desktop file
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/visormd.desktop << EOF
[Desktop Entry]
Name=VisorMD
Comment=Visor de archivos Markdown
Exec=$APP_PATH %f
Terminal=false
Type=Application
MimeType=text/markdown;
Categories=Office;Viewer;
EOF

update-desktop-database ~/.local/share/applications 2>/dev/null || true

# MIME type registration
mkdir -p ~/.local/share/mime/packages
cat > ~/.local/share/mime/packages/visormd.xml << EOF
<?xml version="1.0"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="text/markdown">
    <comment>Markdown file</comment>
    <glob pattern="*.md"/>
    <glob pattern="*.markdown"/>
  </mime-type>
</mime-info>
EOF

update-mime-database ~/.local/share/mime 2>/dev/null || true

# Set as default handler
xdg-mime default visormd.desktop text/markdown 2>/dev/null || true

echo "VisorMD registered for .md files."
echo "Desktop file: ~/.local/share/applications/visormd.desktop"
```

Make the script executable with `chmod +x install-linux.sh`.
</action>

<acceptance_criteria>
- `scripts/install-linux.sh` exists and is executable
- Running it creates `~/.local/share/applications/visormd.desktop`
- Running it creates `~/.local/share/mime/packages/visormd.xml`
- `xdg-mime query default text/markdown` returns `visormd.desktop` after running
- Script is idempotent
- ShellCheck passes
</acceptance_criteria>
</task>

---

## Wave 3: Navigation (Hierarchical TOC + Floating TOC)

- **depends_on:** Wave 1
- **files_modified:** `src/VisorMD/wwwroot/src/index.js` (edit), `src/VisorMD/wwwroot/src/styles.css` (edit), `src/VisorMD/wwwroot/index.html` (edit)
- **autonomous:** true
- **parallel_with:** Wave 2

### Task 3.1: Hierarchical TOC — Rewrite buildToc() with nesting

<task>
<read_first>src/VisorMD/wwwroot/src/index.js (function buildToc around line 376), src/VisorMD/wwwroot/src/styles.css (TOC-related sections, .toc-h1 through .toc-h4 at lines 347-350)</read_first>

<action>
Rewrite the `buildToc()` function to produce a nested `<ul>`/`<li>` tree instead of flat `<a>` tags. Use the stack-based algorithm from research section 2.

Implementation steps:

**In `index.js`** — Replace the existing `buildToc()` function body entirely:
```javascript
function buildToc() {
  toc.innerHTML = '';
  const contentDiv = getActiveContentDiv() || preview;
  const headings = contentDiv.querySelectorAll('h1, h2, h3, h4');
  if (headings.length === 0) return;

  const stack = []; // { ul, level }
  const root = document.createElement('ul');
  root.className = 'toc-tree';
  toc.appendChild(root);
  stack.push({ ul: root, level: 0 });

  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    h.id = id;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = h.textContent;
    a.className = 'toc-item';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
      toc.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
    });
    li.appendChild(a);

    const idx = Array.from(headings).indexOf(h);
    const nextH = headings[idx + 1];
    const nextLevel = nextH ? parseInt(nextH.tagName[1]) : 0;

    // Pop stack until we find the right parent
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.ul || root;
    parent.appendChild(li);

    // If next heading is deeper, create child <ul> inside a <details> wrapper
    if (nextLevel > level) {
      const details = document.createElement('details');
      details.className = 'toc-section';
      details.open = true;
      const summary = document.createElement('summary');
      details.appendChild(summary);
      const childUl = document.createElement('ul');
      details.appendChild(childUl);
      li.appendChild(details);
      stack.push({ ul: childUl, level: nextLevel });
    }
  });
}
```

**In `styles.css`** — Add tree TOC styles and remove (or keep) old `.toc-h1`–`.toc-h4` classes:
```css
.toc-tree { list-style: none; padding: 0; margin: 0; }
.toc-tree ul { list-style: none; padding-left: 16px; }
.toc-item {
  display: block; padding: 4px 12px; font-size: 13px;
  color: var(--text-secondary); cursor: pointer;
  text-decoration: none; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  border-left: 2px solid transparent;
}
.toc-item:hover { color: var(--accent); background: var(--bg-tertiary); }
.toc-item.active { color: var(--accent); border-left-color: var(--accent); }
.toc-section { margin: 0; }
.toc-section summary {
  cursor: pointer; font-size: 12px; color: var(--text-secondary);
  padding: 2px 8px; user-select: none; list-style: none;
}
.toc-section summary:hover { color: var(--accent); }
.toc-section summary::-webkit-details-marker { display: none; }
.toc-section[open] > summary { margin-bottom: 2px; }
```

The old `.toc-h1`, `.toc-h2`, `.toc-h3`, `.toc-h4` classes can be kept (they won't break anything) or removed for cleanliness.

Edge cases:
- No headings found: `buildToc()` clears `toc.innerHTML` and returns early (sidebar stays empty)
- Tab switching calls `buildToc()` each time via the tab activation handler — verify it rebuilds cleanly
- `getActiveContentDiv()` should be called if it exists; fallback to `preview` div
- The `<details>` element is natively supported in WebView2 (Chromium-based)
</action>

<acceptance_criteria>
- `h1` appears at root level, `h2` nested under parent `h1`, `h3` under `h2`, etc.
- Each `<li>` contains an `<a>` with class `toc-item` that scrolls to the heading on click
- Clicking a TOC item scrolls smoothly, highlights the item with `.active` class
- Adjacent same-level headings appear as siblings
- h1 → h2 → h3 → h4 nesting works correctly
- h1 → h3 (skipping h2) nests h3 under h1 correctly
- Jumping back to a higher level (h4 → h2) pops back to correct parent
- `<details>` wrapper appears around sections with children (h1/h2 with deeper headings)
- Tab switching rebuilds TOC without stale DOM
- CSS tree indentation uses `padding-left: 16px` per nesting level
- Active heading has colored left border accent
- All 8 themes render TOC correctly (text colors use `var(--text-secondary)` and `var(--accent)`)
</acceptance_criteria>
</task>

### Task 3.2: Floating TOC toggle button

<task>
<read_first>src/VisorMD/wwwroot/index.html (sidebar and header structure), src/VisorMD/wwwroot/src/index.js (event handlers section), src/VisorMD/wwwroot/src/styles.css (sidebar and responsive sections)</read_first>

<action>
Add a floating toggle button that shows/hides the sidebar as an overlay on narrow screens (≤800px).

**In `index.html`** — Add the toggle button before `</body>`:
```html
<button id="btn-toc-toggle" title="Tabla de contenidos">☰</button>
```

**In `index.js`** — Add event handlers after the DOM content is loaded (in the existing initialization block):
```javascript
// Floating TOC toggle
const tocToggle = document.getElementById('btn-toc-toggle');
if (tocToggle) {
  tocToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  // Click outside closes overlay
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target.id !== 'btn-toc-toggle') {
      sidebar.classList.remove('open');
    }
  });
}
```

**In `styles.css`** — Add floating button styles and sidebar overlay mode:
```css
#btn-toc-toggle {
  position: fixed; bottom: 20px; right: 20px;
  z-index: 1000; width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--accent); color: #fff; border: none;
  font-size: 20px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  display: none;
  transition: transform 0.15s ease;
}
#btn-toc-toggle:hover { transform: scale(1.1); }
#btn-toc-toggle:active { transform: scale(0.95); }

@media (max-width: 800px) {
  #btn-toc-toggle { display: block; }
  #sidebar {
    position: fixed; top: 0; left: -280px;
    width: 260px; height: 100vh; z-index: 999;
    transition: left 0.25s ease;
    box-shadow: 2px 0 12px rgba(0,0,0,0.3);
  }
  #sidebar.open { left: 0; }
  /* Optional: dim background behind overlay */
  #sidebar.open ~ #content { opacity: 0.6; transition: opacity 0.25s ease; }
}
```

Edge cases:
- On wide screens (>800px), the floating button is hidden (`display: none`); sidebar stays in normal position
- On narrow screens (≤800px), the button is visible; sidebar becomes a fixed overlay
- Clicking a TOC item should also close the overlay (optional enhancement)
- The button uses `var(--accent)` so it adapts to all 8 themes
- Works alongside existing sidebar functionality (TOC items, tabs, etc.)
- Test with window resize between narrow and wide
</action>

<acceptance_criteria>
- `#btn-toc-toggle` button exists in the HTML and is hidden on screens >800px
- On screens ≤800px, the button is visible as a round accent-colored button at bottom-right
- Clicking the button toggles `.open` class on `#sidebar`
- Sidebar slides in from the left with smooth CSS transition (0.25s ease)
- Clicking outside the sidebar (on content area) closes the overlay
- Clicking the toggle button again closes the overlay
- Sidebar has proper z-index stacking above content
- Button uses `var(--accent)` color so it works with all themes
- Resizing from narrow to wide restores sidebar to normal layout
</acceptance_criteria>
</task>

---

## Verification Criteria

### Build Verification (run after all tasks complete)
```powershell
# Frontend
cd src/VisorMD/wwwroot
npm run build     # esbuild bundle

# Backend
cd src/VisorMD
dotnet build -c Release    # 0 warnings, 0 errors
```

### Smoke Tests
1. `.\src\VisorMD\bin\Release\net9.0\VisorMD.exe --help` — shows help text
2. `.\src\VisorMD\bin\Release\net9.0\VisorMD.exe -h` — same as --help
3. `.\src\VisorMD\bin\Release\net9.0\VisorMD.exe README.md` — opens window, TOC shows hierarchical nesting
4. Resize window to ≤800px — floating button appears, sidebar becomes overlay
5. Click TOC items in hierarchy — smooth scroll, active highlight
6. Switch tabs — TOC rebuilds correctly
7. Change themes — all TOC/floating button colors adapt

### Install Script Verification
1. `scripts/install-mac.sh` — dry-run syntax check (needs macOS to run fully)
2. `scripts/install-linux.sh` — dry-run syntax check (`bash -n`)
