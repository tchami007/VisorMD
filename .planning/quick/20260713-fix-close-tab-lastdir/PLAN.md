## Fix: close tab button not working (Error 1)

- Tab close button `×` had no click handler → event bubbled to `.tab-btn` which called `switchTab` instead of `closeTab`
- Added event delegation on `tabList` for `.tab-close` clicks with `stopPropagation`

## Fix: open docs in last directory (Error 2)

- `Ctrl+O` triggered hidden file input (frontend-only) → didn't update backend's `s_lastDirectory`
- Changed to use `sendToBackend({ type: 'show-open-dialog' })` so backend dialog reuses last directory

## Files changed

- `src/VisorMD/wwwroot/src/index.js` — delegated close click handler + Ctrl+O route to backend
