#!/bin/bash
set -e
cd "$(dirname "$0")/../src/VisorMD/wwwroot"
echo "Building frontend..."
npx esbuild src/index.js --bundle --outfile=dist/bundle.js --format=iife --global-name=VisorMD --loader:.css=text

cd "$(dirname "$0")/../src"
echo "Building .NET backend..."
dotnet publish VisorMD/VisorMD.csproj -c Release -r linux-x64 --self-contained -o ../dist/linux-x64

echo "Done."
