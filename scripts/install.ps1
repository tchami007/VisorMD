param(
    [switch]$DesktopShortcut,
    [switch]$AddToPath,
    [switch]$NoCheckWebView2,
    [ValidateSet('user', 'machine')][string]$Scope = 'user'
)

$AppName = 'VisorMD'
$ExeName = 'VisorMD.exe'

if ($Scope -eq 'machine') {
    $InstallDir = Join-Path ${env:ProgramFiles} $AppName
    $StartMenuDir = Join-Path ([Environment]::GetFolderPath('CommonStartMenu')) 'Programs' $AppName
    $ShortcutScope = 'AllUsers'
} else {
    $InstallDir = Join-Path $env:LOCALAPPDATA $AppName
    $StartMenuDir = Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs' $AppName
    $ShortcutScope = 'CurrentUser'
}

# --- Check WebView2 Runtime ---
if (-not $NoCheckWebView2) {
    $wv2 = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00FB3A68797D}' -Name 'pv' -ErrorAction SilentlyContinue
    if (-not $wv2) {
        $wv2 = Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00FB3A68797D}' -Name 'pv' -ErrorAction SilentlyContinue
    }
    if (-not $wv2) {
        Write-Warning "WebView2 Runtime no detectado. VisorMD lo requiere."
        $choice = Read-Host "Descargar e instalar WebView2 Runtime? (s/N)"
        if ($choice -eq 's') {
            $url = 'https://go.microsoft.com/fwlink/p/?LinkId=2124703'
            $tmp = Join-Path $env:TEMP 'MicrosoftEdgeWebView2Setup.exe'
            Write-Host "Descargando WebView2 Runtime..."
            Invoke-WebRequest -Uri $url -OutFile $tmp
            Write-Host "Instalando (silent)..."
            Start-Process -Wait -FilePath $tmp -ArgumentList '/silent', '/install'
            Remove-Item $tmp -Force
        } else {
            Write-Host "WebView2 requerido. Puedes descargarlo manualmente de:"
            Write-Host "  https://developer.microsoft.com/microsoft-edge/webview2/"
            exit 1
        }
    }
}

# --- Get source files ---
$ScriptDir = Split-Path -Parent $PSCommandPath
$SourceDir = Join-Path (Split-Path $ScriptDir) 'dist' 'release'

if (-not (Test-Path $SourceDir)) {
    Write-Error "No se encuentra $SourceDir. Ejecuta primero: dotnet publish"
    exit 1
}

# --- Install files ---
Write-Host "Instalando $AppName en $InstallDir ..."
if (-not (Test-Path $InstallDir)) { New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null }

Copy-Item -Path "$SourceDir\*" -Destination $InstallDir -Recurse -Force

$exePath = Join-Path $InstallDir $ExeName
if (-not (Test-Path $exePath)) {
    Write-Error "Error: $ExeName no encontrado en $SourceDir"
    exit 1
}

Remove-Item (Join-Path $InstallDir '*.pdb') -Force -ErrorAction SilentlyContinue

# --- Start Menu shortcut ---
if (-not (Test-Path $StartMenuDir)) { New-Item -ItemType Directory -Path $StartMenuDir -Force | Out-Null }
$shortcutPath = Join-Path $StartMenuDir "$AppName.lnk"
$wshell = New-Object -ComObject WScript.Shell
$shortcut = $wshell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $InstallDir
$shortcut.Description = 'Visor de archivos Markdown'
$shortcut.Save()
Write-Host "  [✓] Acceso directo en menú Inicio"

# --- Desktop shortcut ---
if ($DesktopShortcut) {
    $desktop = [Environment]::GetFolderPath('Desktop')
    $desktopShortcut = Join-Path $desktop "$AppName.lnk"
    $s = $wshell.CreateShortcut($desktopShortcut)
    $s.TargetPath = $exePath
    $s.WorkingDirectory = $InstallDir
    $s.Description = 'Visor de archivos Markdown'
    $s.Save()
    Write-Host "  [✓] Acceso directo en Escritorio"
}

# --- File association (.md, .markdown) ---
try {
    $regBase = 'HKCU:\Software\Classes'  # user scope = no admin needed
    $mdKey = "$regBase\.md"
    $markdownKey = "$regBase\.markdown"
    $appKey = "$regBase\VisorMD.md"

    # Create prog ID
    if (-not (Test-Path $appKey)) { New-Item -Path $appKey -Force | Out-Null }
    Set-ItemProperty -Path $appKey -Name '(Default)' -Value 'Markdown File'
    $shellKey = "$appKey\shell\open\command"
    if (-not (Test-Path $shellKey)) { New-Item -Path $shellKey -Force | Out-Null }
    Set-ItemProperty -Path $shellKey -Name '(Default)' -Value "`"$exePath`" `"%1`""

    # Set icon
    $defaultIcon = "$appKey\DefaultIcon"
    if (-not (Test-Path $defaultIcon)) { New-Item -Path $defaultIcon -Force | Out-Null }
    Set-ItemProperty -Path $defaultIcon -Name '(Default)' -Value "`"$exePath`",0"

    # Associate .md
    if (-not (Test-Path $mdKey)) { New-Item -Path $mdKey -Force | Out-Null }
    Set-ItemProperty -Path $mdKey -Name '(Default)' -Value 'VisorMD.md'

    # Associate .markdown
    if (-not (Test-Path $markdownKey)) { New-Item -Path $markdownKey -Force | Out-Null }
    Set-ItemProperty -Path $markdownKey -Name '(Default)' -Value 'VisorMD.md'

    Write-Host "  [✓] Asociación de archivos .md / .markdown"
} catch {
    Write-Warning "  [!] No se pudo registrar asociación de archivos: $_"
}

# --- PATH ---
if ($AddToPath) {
    $pathTarget = if ($Scope -eq 'machine') { 'Machine' } else { 'User' }
    $currentPath = [Environment]::GetEnvironmentVariable('Path', $pathTarget)
    if ($currentPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable('Path', "$currentPath;$InstallDir", $pathTarget)
        Write-Host "  [✓] $InstallDir agregado al PATH ($ShortcutScope)"
    }
}

Write-Host ""
Write-Host "✓ $AppName instalado correctamente."
Write-Host "  Ejecuta: $exePath"
Write-Host "  O desde menú Inicio > $AppName"
