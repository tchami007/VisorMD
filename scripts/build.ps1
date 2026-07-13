param(
    [ValidateSet('Debug', 'Release')][string]$Configuration = 'Release',
    [string]$Runtime = 'win-x64',
    [string]$OutputDir = ''
)

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$ProjectDir = Join-Path $RepoRoot 'src' | Join-Path -ChildPath 'VisorMD'
$Wwwroot = Join-Path $ProjectDir 'wwwroot'

if (-not $OutputDir) {
    $OutputDir = Join-Path $RepoRoot 'dist' | Join-Path -ChildPath 'release'
}

Write-Host "=== VisorMD Build ==="
Write-Host "Proyecto: $ProjectDir"
Write-Host "Runtime:  $Runtime"
Write-Host "Config:   $Configuration"
Write-Host "Output:   $OutputDir"
Write-Host ""

# 1. Build frontend
Write-Host "[1/3] Frontend (esbuild)..."
Push-Location $Wwwroot
npm install --silent 2>$null
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; Pop-Location; exit 1 }
Write-Host "  [OK]"
Pop-Location

# 2. Build backend
Write-Host "[2/3] Backend (dotnet publish)..."
Push-Location $ProjectDir
dotnet publish -c $Configuration -r $Runtime --self-contained -o $OutputDir
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; Pop-Location; exit 1 }
Write-Host "  [OK]"
Pop-Location

# 3. Clean up
Write-Host "[3/3] Limpiando..."
Remove-Item (Join-Path $OutputDir '*.pdb') -Force -ErrorAction SilentlyContinue
Write-Host "  [OK]"

$exeSize = (Get-Item (Join-Path $OutputDir 'VisorMD.exe')).Length
Write-Host ""
Write-Host "OK Build completado: $OutputDir"
Write-Host "  VisorMD.exe: $([math]::Round($exeSize / 1MB, 1)) MB"
Write-Host ""
Write-Host "Instalar: .\scripts\install.ps1"
