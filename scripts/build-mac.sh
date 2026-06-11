#!/bin/bash
set -e
cd "$(dirname "$0")/../src/VisorMD/wwwroot"
echo "Building frontend..."
npx esbuild src/index.js --bundle --outfile=dist/bundle.js --format=iife --global-name=VisorMD --loader:.css=text

cd "$(dirname "$0")/../src"
echo "Building .NET backend (Intel)..."
dotnet publish VisorMD/VisorMD.csproj -c Release -r osx-x64 --self-contained -o ../dist/osx-x64

echo "Building .NET backend (Apple Silicon)..."
dotnet publish VisorMD/VisorMD.csproj -c Release -r osx-arm64 --self-contained -o ../dist/osx-arm64

echo "Done."
