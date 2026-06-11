param(
    [string]$InstallDir = "$env:LOCALAPPDATA\VisorMD"
)

$ErrorActionPreference = "Stop"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Se requieren permisos de administrador. Reejecutando como admin..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

Write-Host "Desinstalando VisorMD..." -ForegroundColor Yellow

# Remove files
if (Test-Path $InstallDir) {
    Remove-Item -Path "$InstallDir\VisorMD.exe" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$InstallDir\PhotinoX.Native.dll" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$InstallDir\WebView2Loader.dll" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $InstallDir -Force -ErrorAction SilentlyContinue
    Write-Host "  Archivos eliminados" -ForegroundColor Gray
}

# Remove from PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -like "*$InstallDir*") {
    $newPath = ($currentPath.Split(';') | Where-Object { $_ -ne $InstallDir }) -join ';'
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    Write-Host "  PATH restaurado" -ForegroundColor Gray
}

# Remove file association
cmd /c "assoc .md= 2>nul" | Out-Null
Remove-Item -Path "HKCR:\VisorMD.md" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCR:\Applications\VisorMD.exe" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCR:\*\shell\Abrir con VisorMD" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  Asociación .md eliminada" -ForegroundColor Gray

Write-Host ""
Write-Host "Desinstalación completada." -ForegroundColor Green
