!define PRODUCT_NAME "VisorMD"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "VisorMD"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "VisorMD-Installer.exe"
InstallDir "$LOCALAPPDATA\VisorMD"
RequestExecutionLevel admin

Section "Instalar VisorMD" SEC_MAIN
  SetOutPath "$INSTDIR"
  File "..\dist\win-x64-aot\VisorMD.exe"
  File "..\dist\win-x64-aot\PhotinoX.Native.dll"
  File "..\dist\win-x64-aot\WebView2Loader.dll"

  WriteUninstaller "$INSTDIR\uninstall.exe"

  CreateDirectory "$SMPROGRAMS\VisorMD"
  CreateShortCut "$SMPROGRAMS\VisorMD\VisorMD.lnk" "$INSTDIR\VisorMD.exe"
  CreateShortCut "$DESKTOP\VisorMD.lnk" "$INSTDIR\VisorMD.exe"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\VisorMD.exe"

  ; File association .md
  WriteRegStr HKCR ".md" "" "VisorMD.md"
  WriteRegStr HKCR "VisorMD.md" "" "Documento Markdown"
  WriteRegStr HKCR "VisorMD.md\DefaultIcon" "" "$INSTDIR\VisorMD.exe,0"
  WriteRegStr HKCR "VisorMD.md\shell\open\command" "" '"$INSTDIR\VisorMD.exe" "%1"'

  ; PATH
  EnVar::AddValue "PATH" "$INSTDIR"

  ; Refresh shell icons
  System::Call "shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\VisorMD.exe"
  Delete "$INSTDIR\PhotinoX.Native.dll"
  Delete "$INSTDIR\WebView2Loader.dll"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"

  Delete "$SMPROGRAMS\VisorMD\VisorMD.lnk"
  RMDir "$SMPROGRAMS\VisorMD"
  Delete "$DESKTOP\VisorMD.lnk"

  DeleteRegKey HKCR ".md"
  DeleteRegKey HKCR "VisorMD.md"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

  EnVar::DeleteValue "PATH" "$INSTDIR"
SectionEnd
