# Phase 3: Madurez - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the remaining VisorMD maturity features: full CLI (--help), document outline (enhanced TOC hierarchy), floating TOC toggle, file association (.md registration), and --print support. The themes subsystem (Wave 1) is already complete and shipped.

</domain>

<decisions>
## Implementation Decisions

### CLI Design
- **D-01 [informational]:** Keep current `FreeConsole()` behavior — app always opens as GUI window. No dual-mode (no separate console/CLI mode).
- **D-02 [informational]:** Only add `--help` flag. No `--version`, no `--print` flag (printing remains Ctrl+P / print button only).
- **D-03 [informational]:** `--help` output in Spanish, concise — usage line + available flags. One-page output.
- **D-04 [informational]:** Existing `--theme` and positional file arg behavior unchanged.

### Document Map
- **D-05 [informational]:** Simplest approach — enhance existing sidebar TOC (`#toc`) with hierarchy/indentation by heading level (`h1`, `h2`, `h3`, `h4`). No separate panel, no floating overlay for the map. The TOC already works at the sidebar level — just nest it.

### Claude's Discretion
- **Floating TOC** — not discussed; planner to decide simplest approach (floating button, collapsible toggle, or enhancement to sidebar).
- **File association** (RF17) — not discussed; planner to decide .md/.markdown extension registration approach (Windows Registry, macOS UTIs, Linux mime). Keep it simple.
- **--print** — not discussed; keep current Ctrl+P / `printContent()` implementation. No CLI `--print` flag.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — RF13 (CLI), RF15 (TOC flotante), RF16 (Mapa del documento), RF17 (File association)

### Source Code
- `src/VisorMD/Program.cs` — Current CLI arg parsing (`--theme`, positional file, `FreeConsole()`)
- `src/VisorMD/wwwroot/src/index.js` — Frontend: TOC `buildToc()` at line 376, theme handling, IPC messages
- `src/VisorMD/wwwroot/index.html` — Layout: sidebar with `#toc` nav, header with controls
- `src/VisorMD/Messages.cs` — IPC message types (source-generated JSON serializer, AOT-compatible)
- `src/VisorMD/wwwroot/src/styles.css` — Theme CSS variables, sidebar/TOC styles

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`buildToc()`** in `index.js:376` — Already extracts `h1-h4` from active tab content and builds sidebar `<nav id="toc">`. Extend to add hierarchical nesting.
- **`Program.cs` arg parser** — Simple `for` loop with `switch` on `args[i]`. Add `--help` case. `FreeConsole()` at line 83.
- **IPC pattern** — Messages are serialized via `System.Text.Json` source generators (`AppJsonContext`). New command messages follow `SetThemeMessage` pattern.

### Established Patterns
- **Backend→Frontend IPC:** Window sends JSON via `SendWebMessage()`, frontend receives via `window.external.receiveMessage(callback)`.
- **Frontend→Backend IPC:** `sendToBackend({ type: "..." })` via `window.external.sendMessage()`.
- **Theme persistence:** `localStorage` key `visormd-theme`.
- **Print:** Creates hidden iframe with styled content, calls `iframe.contentWindow.print()`.

### Integration Points
- `#toc` nav in sidebar — extend for hierarchical document map
- `#header-controls` — add floating TOC toggle button
- `Program.cs` argument parser — add `--help` case before `FreeConsole()`
- `src/VisorMD/VisorMD.csproj` — ensure proper runtime identifiers for file association

</code_context>

<specifics>
## Specific Ideas

No specific references — user wants standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: phase-3-Madurez*
*Context gathered: 2026-07-13*
