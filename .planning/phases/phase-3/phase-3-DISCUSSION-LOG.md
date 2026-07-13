# Phase 3: Madurez - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** phase-3-Madurez
**Areas discussed:** CLI Design, Document Map

---

## CLI Design

| Option | Description | Selected |
|--------|-------------|----------|
| Dual mode | Console mode for --help/--print, window mode for files | |
| Always window | Keep current FreeConsole behavior | ✓ |
| Minimal flags | Only add --help, everything else via GUI | |
| Full Unix-style | --help, --print FILE, --version, --new-window, --theme, positional | |

**User's choice:** Always window
**Notes:** Keep console hidden. Only add `--help`. Spanish concise output.

---

## Document Map

| Option | Description | Selected |
|--------|-------------|----------|
| Enhanced TOC | Add hierarchy/indentation to existing sidebar TOC | ✓ |
| Separate panel | Dedicated "Mapa" tab/pane | |
| Floating overlay | Floating panel on hover/click | |

**User's choice:** Whatever is simplest (enhanced TOC hierarchy in sidebar)

---

## Claude's Discretion

- **Floating TOC** — not discussed; planner decides simplest approach
- **File association** — not discussed; planner decides registration approach
- **--print** — not discussed; keep current Ctrl+P implementation

## Deferred Ideas

None.
