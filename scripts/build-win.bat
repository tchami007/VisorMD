@echo off
set DIST=%~dp0..\dist\win-x64-aot

cd /d "%~dp0..\src\VisorMD\wwwroot"
echo Building frontend...
call npx esbuild src/index.js --bundle --outfile=dist/bundle.js --format=iife --global-name=VisorMD --loader:.css=text
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Copying KaTeX assets...
if not exist dist\fonts\NUL call :copyKatex
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

cd /d "%~dp0..\src"
echo Building .NET backend...
dotnet publish VisorMD\VisorMD.csproj -c Release -r win-x64 --self-contained -o %DIST%
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Copying README...
copy "%~dp0..\README.md" "%DIST%\README.md" >nul 2>&1

echo Done. Output: %DIST%
exit /b 0

:copyKatex
copy node_modules\katex\dist\katex.min.css dist\katex.css >nul
xcopy /E /I /Y node_modules\katex\dist\fonts dist\fonts >nul
exit /b 0
