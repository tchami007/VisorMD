---
status: complete
---

## Quick task: Fix close tab + last directory

**Error 1:** Clicking `×` on a tab now calls `closeTab()` via delegated event on `tabList`. Previously it bubbled to `.tab-btn` and switched to the tab instead.

**Error 2:** `Ctrl+O` now routes through the backend IPC dialog (`show-open-dialog`) which uses `s_lastDirectory`, instead of the hidden file input which had no access to the backend's directory state. The 📂 button and `Ctrl+O` now behave identically.
