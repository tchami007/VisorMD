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
