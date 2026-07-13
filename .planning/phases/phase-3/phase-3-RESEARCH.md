# Phase 3: Madurez — Research

**Compiled:** 2026-07-13
**Purpose:** Technical research to inform PLAN.md creation.

---

## 1. CLI `--help`

### Recommended approach
Add a `--help` / `-h` case to the existing `switch` in `Program.cs:40`. Print Spanish help text via `Console.WriteLine()`, then `Environment.Exit(0)`. Do **not** call `FreeConsole()` — the console exists until we exit. This is the simplest possible approach: no new classes, no command-line parser library needed.

### Files to modify
- `src/VisorMD/Program.cs` — add `case "--help"` (and `case "-h"`) before the `default` branch

### Key code pattern
```csharp
case "--help":
case "-h":
    Console.WriteLine(@"VisorMD — Visor de archivos Markdown
Uso: visormd [opciones] [archivo]

Opciones:
  --theme <tema>    Tema visual (light, dark, sepia, dracula, highcontrast, ocean, matrix, starwars)
  --help, -h        Muestra esta ayuda

Ejemplos:
  visormd documento.md
  visormd --theme dracula guia.md");
    Environment.Exit(0);
    break;
```

### Risks / edge cases
- Must come **before** `FreeConsole()` (line 83), otherwise console is gone and output is invisible.
- `--help` with a positional file arg is fine — help takes precedence and exits.
- `--help --theme blah` — still just show help and exit, ignore other flags.
- On Windows, if launched from a GUI context (double-click .md file), there's no console to write to. The user won't see help. This is an inherent limitation of the `FreeConsole()` app model (D-01). Acceptable.

---

## 2. Document Map (hierarchical TOC)

### Recommended approach
Modify `buildToc()` in `index.js` to produce a **nested `<ul>`/`<li>` tree** instead of flat `<a>` tags. Track current heading level and nest/unnest `<ul>` elements as level changes. Add collapsible `<details>`/`<summary>` around parent items (h1, h2) for expand/collapse.

The existing CSS classes `.toc-h1` through `.toc-h4` (styles.css:347-350) already provide indentation via `padding-left`. Replace this with tree nesting.

### Files to modify
- `src/VisorMD/wwwroot/src/index.js` — rewrite `buildToc()` (~20 lines → ~50 lines)
- `src/VisorMD/wwwroot/src/styles.css` — update `.toc-item` rules for tree structure, add expand/collapse styles

### Key code pattern
```js
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

    // Collapsible wrapper for h1/h2 with children
    const nextH = headings[Array.from(headings).indexOf(h) + 1];
    const nextLevel = nextH ? parseInt(nextH.tagName[1]) : 0;
    if (nextLevel > level) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      details.appendChild(summary);
      details.className = 'toc-section';
      li.appendChild(details);
    }

    // Pop stack until we find the right parent
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.ul || root;
    parent.appendChild(li);

    if (nextLevel > level) {
      const childUl = document.createElement('ul');
      li.querySelector('details')?.appendChild(childUl) || li.appendChild(childUl);
      stack.push({ ul: childUl, level: nextLevel });
    }
  });
}
```

### CSS additions
```css
.toc-tree { list-style: none; padding: 0; margin: 0; }
.toc-tree ul { list-style: none; padding-left: 16px; }
.toc-item { display: block; padding: 4px 12px; font-size: 13px; color: var(--text-secondary); cursor: pointer; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 2px solid transparent; }
.toc-item:hover { color: var(--accent); background: var(--bg-tertiary); }
.toc-item.active { color: var(--accent); border-left-color: var(--accent); }
.toc-section summary { cursor: pointer; font-size: 12px; color: var(--text-secondary); padding: 2px 8px; user-select: none; }
.toc-section summary:hover { color: var(--accent); }
```

### Risks / edge cases
- Deeply nested headings (h1 > h2 > h3 > h4 > h1) — the stack algorithm handles this naturally.
- No headings at all — `buildToc()` clears and returns early, sidebar shows empty state.
- h5/h6 currently ignored (D-05 says h1-h4). Easy to extend later.
- Tab switching calls `buildToc()` each time — ensure the tree rebuilds cleanly (no stale DOM).
- The `<details>` polyfill works in WebView2 natively — no JS needed.

---

## 3. Floating TOC

### Recommended approach
Add a **floating toggle button** (bottom-right corner, fixed position) that shows/hides the sidebar as a **slide-in overlay**. On click, the sidebar slides in from the left on top of the content. Click a close button or click outside to dismiss.

Since D-05 says "enhance existing sidebar, not a separate panel", the floating TOC button simply toggles the sidebar's visibility in overlay mode. The existing `#sidebar` element is reused.

### Files to modify
- `src/VisorMD/wwwroot/index.html` — add floating button element
- `src/VisorMD/wwwroot/src/index.js` — add event handler for toggle
- `src/VisorMD/wwwroot/src/styles.css` — add overlay mode styles

### Key code pattern (HTML)
```html
<button id="btn-toc-toggle" title="Tabla de contenidos">☰</button>
```
Add before `</body>` or in `#header-controls`.

### Key code pattern (CSS)
```css
#btn-toc-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  display: none; /* hidden on wide screens */
}

@media (max-width: 800px) {
  #btn-toc-toggle { display: block; }
  #sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    height: 100vh;
    z-index: 999;
    transition: left 0.2s ease;
    box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  }
  #sidebar.open { left: 0; }
}
```

### Key code pattern (JS)
```js
document.getElementById('btn-toc-toggle').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
// Click outside closes
document.addEventListener('click', (e) => {
  if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target.id !== 'btn-toc-toggle') {
    sidebar.classList.remove('open');
  }
});
```

### Risks / edge cases
- On wide screens (>800px), the sidebar remains in its normal position (no overlay). The floating button is hidden.
- On narrow screens, sidebar becomes a fixed overlay that slides in from the left.
- The `.open` class transition must be smooth — use CSS `transition`.
- Overlay may cover the content partially — ensure it has `box-shadow` and content behind is dimmed (optional).
- Works with any theme because it uses `var(--bg-secondary)` etc.

---

## 4. File association (.md registration)

### Recommended approach

**Windows** — Already implemented in two places:
- `scripts/install.ps1:93-122` — Registers `HKCU\Software\Classes\.md` → `VisorMD.md` and the prog ID with shell open command.
- `scripts/setup.nsi:59-63` — Same via NSIS (HKCR, admin).

No changes needed for Windows — the installation scripts already handle it. Validate they work correctly.

**macOS** — Add a `scripts/install-mac.sh` that:
1. Registers UTI via `/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister`
2. Creates a `.plist` for the UTI declaration

Simplest approach: append to `build-mac.sh` or create `install-mac.sh`:
```bash
#!/bin/bash
APP_PATH="/Applications/VisorMD.app"
# Register .md to open with VisorMD
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -app "$APP_PATH" -type md
# Alternative: create a plist for the app bundle
defaults write "$APP_PATH/Contents/Info" CFBundleDocumentTypes -array-add '
<dict>
  <key>CFBundleTypeName</key>
  <string>Markdown File</string>
  <key>CFBundleTypeRole</key>
  <string>Viewer</string>
  <key>LSHandlerRank</key>
  <string>Default</string>
  <key>LSItemContentTypes</key>
  <array>
    <string>net.daringfireball.markdown</string>
  </array>
</dict>'
```

**Linux** — Simplest: create `scripts/install-linux.sh` that:
1. Installs a `.desktop` file to `~/.local/share/applications/visormd.desktop`
2. Runs `update-desktop-database`
3. Registers MIME type via `~/.local/share/mime/packages/visormd.xml`

```bash
#!/bin/bash
APP_PATH="/usr/local/bin/visormd"
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
update-desktop-database ~/.local/share/applications

# MIME registration
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
update-mime-database ~/.local/share/mime
```

### Files to modify/create
- `scripts/install-mac.sh` — new file (or add to `build-mac.sh`)
- `scripts/install-linux.sh` — new file (or add to `build-linux.sh`)
- `scripts/install.ps1` — validate existing Windows registration works (no changes needed)
- `scripts/build.ps1` / `scripts/build-win.bat` — no changes needed

### Risks / edge cases
- macOS: App needs to be bundled as `.app` (not just raw binary) for UTI registration to stick. If VisorMD is published as a plain `osx-x64` binary without an app bundle, `lsregister` won't work. The simplest path is to create a minimal `.app` wrapper.
- Linux: `xdg-mime query default text/markdown` to verify. User may have other apps registered (e.g., Typora, VS Code) — VisorMD should not override without confirmation.
- Windows: Already handled in install scripts.
- Cross-platform: File association requires the binary to accept a file path as positional argument (already implemented at `Program.cs:68-76`).

---

## 5. `--print`

### Current implementation (keep as-is)
`printContent()` in `src/VisorMD/wwwroot/src/index.js:330-358` creates a hidden iframe, writes styled HTML content, and calls `iframe.contentWindow.print()`. Triggered by:
- Ctrl+P keyboard shortcut (`index.js:74`)
- Print button `#btn-print` click (`index.js:58`)

### No changes needed
Decision D-02 explicitly states: no `--print` CLI flag. Printing remains a GUI-only feature (Ctrl+P / button).

### Decision rationale
- CLI `--print` would require headless rendering of Markdown to HTML and sending to system printer — complex.
- Ctrl+P works well and uses the OS print dialog.
- User can pipe file to another tool if they need CLI printing.

---

## 6. Build verification

### Current build pipeline
The project has two build steps:
1. **Frontend**: `src/VisorMD/wwwroot/` — esbuild bundles `src/index.js` → `dist/bundle.js`
2. **Backend**: `src/VisorMD/` — `dotnet publish` produces self-contained executable

Scripts available:
- `scripts/build.ps1` (Windows, main)
- `scripts/build-win.bat` (Windows, batch)
- `scripts/build-mac.sh` (macOS)
- `scripts/build-linux.sh` (Linux)

### Recommended verification commands
```powershell
# 1. Frontend build (validates JS + CSS bundle)
cd src/VisorMD/wwwroot
npm install
npm run build     # node esbuild.config.mjs

# 2. Backend build (validates C# compilation + publish)
cd src/VisorMD
dotnet build -c Release              # quick syntax check
dotnet publish -c Release -r win-x64 --self-contained -o dist\test

# 3. Smoke test — run with --help
.\dist\test\VisorMD.exe --help       # should show help and exit

# 4. Smoke test — open a file
.\dist\test\VisorMD.exe README.md    # should open window
```

### Files to modify (build-related)
- `src/VisorMD/wwwroot/package.json` — no changes unless adding dependencies
- `src/VisorMD/VisorMD.csproj` — no changes unless adding NuGet packages

### Risks / edge cases
- `dotnet publish` with `PublishAot=true` may fail on first run if NativeAOT prerequisites are missing (e.g., C++ build tools on Windows). Use `dotnet build` for quick validation, `dotnet publish` for full verification.
- Frontend bundle step requires `node_modules` present — run `npm install` first.
- After modifying `index.js`, `styles.css`, or `index.html`, the frontend must be rebuilt — changes are embedded as resources in the .NET assembly.

---

## Summary of files to modify

| Item | Files | Type |
|------|-------|------|
| `--help` | `src/VisorMD/Program.cs` | Edit |
| Hierarchical TOC | `src/VisorMD/wwwroot/src/index.js` (buildToc), `styles.css` | Edit |
| Floating TOC | `index.html` (button), `index.js` (handler), `styles.css` (overlay) | Edit |
| File association (macOS) | `scripts/install-mac.sh` | Create |
| File association (Linux) | `scripts/install-linux.sh` | Create |
| Build verification | Run existing scripts | Test only |
