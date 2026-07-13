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
