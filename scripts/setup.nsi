!define PRODUCT_NAME "VisorMD"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "VisorMD"
!define PRODUCT_WEB_SITE "https://github.com/anomalyco/opencode"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\VisorMD.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor lzma

; Modern UI
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "WinVer.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${NSISDIR}\Contrib\Modern UI\License.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "English"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "VisorMD-Setup.exe"
InstallDir "$PROGRAMFILES64\${PRODUCT_NAME}"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

Section "Instalar" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer

  File "..\dist\release\VisorMD.exe"
  File "..\dist\release\PhotinoX.Native.dll"
  File "..\dist\release\WebView2Loader.dll"

  ; Start Menu
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\VisorMD.exe" "" "$INSTDIR\VisorMD.exe" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Desinstalar ${PRODUCT_NAME}.lnk" "$INSTDIR\uninst.exe"

  ; Desktop shortcut
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\VisorMD.exe"

  ; File association
  WriteRegStr HKCR ".md" "" "VisorMD.md"
  WriteRegStr HKCR ".markdown" "" "VisorMD.md"
  WriteRegStr HKCR "VisorMD.md" "" "Markdown File"
  WriteRegStr HKCR "VisorMD.md\DefaultIcon" "" "$INSTDIR\VisorMD.exe,0"
  WriteRegStr HKCR "VisorMD.md\shell\open\command" "" `"$INSTDIR\VisorMD.exe" "%1"`

  ; App Paths
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\VisorMD.exe"

  ; Uninstaller
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
SectionEnd

Section -Post
  ; WebView2 Runtime check via PowerShell (requires admin)
  nsExec::ExecToStack 'powershell -NoProfile -Command "if (-not (Get-ItemProperty HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00FB3A68797D} -Name pv -ErrorAction SilentlyContinue)) { exit 1 }"'
  Pop $0
  IntCmp $0 0 skipWebView2
  MessageBox MB_YESNO "WebView2 Runtime no detectado. Es necesario para VisorMD.$\n¿Descargar e instalar ahora?" IDNO skipWebView2
  NSISdl::download "https://go.microsoft.com/fwlink/p/?LinkId=2124703" "$TEMP\MicrosoftEdgeWebView2Setup.exe"
  ExecWait "$TEMP\MicrosoftEdgeWebView2Setup.exe /silent /install"
  Delete "$TEMP\MicrosoftEdgeWebView2Setup.exe"
skipWebView2:
SectionEnd

Section Uninstall
  Delete "$INSTDIR\VisorMD.exe"
  Delete "$INSTDIR\PhotinoX.Native.dll"
  Delete "$INSTDIR\WebView2Loader.dll"
  Delete "$INSTDIR\uninst.exe"
  RMDir "$INSTDIR"

  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\Desinstalar ${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"

  DeleteRegKey HKCR ".md" ""
  DeleteRegKey HKCR ".markdown" ""
  DeleteRegKey HKCR "VisorMD.md"
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
SectionEnd
