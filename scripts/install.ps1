param(
    [string]$InstallDir = "$env:LOCALAPPDATA\VisorMD"
)

$ErrorActionPreference = "Stop"

# Requires admin for registry changes
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Se requieren permisos de administrador. Reejecutando como admin..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "Instalando VisorMD..." -ForegroundColor Green

# Create installation directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Copy files
$sourceDir = Join-Path $PSScriptRoot "..\dist\win-x64-aot"
Copy-Item -Path (Join-Path $sourceDir "VisorMD.exe") -Destination $InstallDir -Force
Copy-Item -Path (Join-Path $sourceDir "PhotinoX.Native.dll") -Destination $InstallDir -Force
Copy-Item -Path (Join-Path $sourceDir "WebView2Loader.dll") -Destination $InstallDir -Force

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$InstallDir", "Machine")
    Write-Host "  Añadido al PATH del sistema" -ForegroundColor Gray
}

# File association .md
Write-Host "  Registrando asociación .md..." -ForegroundColor Gray
$exePath = "$InstallDir\VisorMD.exe"
cmd /c "ftype VisorMD.md=`"$exePath`" `"%1`" 2>nul"
cmd /c "assoc .md=VisorMD.md 2>nul"

# Also register via registry for robustness
$regKey = "HKCR:\Applications\VisorMD.exe\shell\open\command"
New-Item -Path $regKey -Force | Out-Null
Set-ItemProperty -Path $regKey -Name "(Default)" -Value "`"$exePath`" `"%1`""

$regAssoc = "HKCR:\VisorMD.md\shell\open\command"
New-Item -Path $regAssoc -Force | Out-Null
Set-ItemProperty -Path $regAssoc -Name "(Default)" -Value "`"$exePath`" `"%1`""

Set-ItemProperty -Path "HKCR:\.md" -Name "(Default)" -Value "VisorMD.md"

# Context menu
$contextKey = "HKCR:\*\shell\Abrir con VisorMD"
New-Item -Path $contextKey -Force | Out-Null
Set-ItemProperty -Path $contextKey -Name "(Default)" -Value "Abrir con VisorMD"
Set-ItemProperty -Path $contextKey -Name "Icon" -Value "`"$exePath`""

$contextCmd = "$contextKey\command"
New-Item -Path $contextCmd -Force | Out-Null
Set-ItemProperty -Path $contextCmd -Name "(Default)" -Value "`"$exePath`" `"%1`""

# Refresh shell
$null = [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
[System.Windows.Forms.Application]::DoEvents()

Write-Host ""
Write-Host "Instalación completada." -ForegroundColor Green
Write-Host "  VisorMD instalado en: $InstallDir" -ForegroundColor Gray
Write-Host "  Asociación .md: activada" -ForegroundColor Gray
Write-Host "  Menú contextual: activado" -ForegroundColor Gray
Write-Host "  PATH: añadido" -ForegroundColor Gray
Write-Host ""
Write-Host "Arrastra un .md a VisorMD.exe o haz doble clic en un .md para probar." -ForegroundColor Cyan
