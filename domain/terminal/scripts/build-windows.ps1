#!/usr/bin/env pwsh

# RinaWarp Terminal Pro - Windows Build Script
# Usage: .\scripts\build-windows.ps1 [options]

param(
    [switch]$CodeSign,
    [switch]$Release,
    [switch]$SkipTests
)

Write-Host "🪟 Building RinaWarp Terminal Pro for Windows..." -ForegroundColor Green

# Check if running on Windows
if ($env:OS -notlike "*Windows*") {
    Write-Host "❌ This script must be run on Windows" -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:NODE_ENV = "production"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm ci

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Cyan
npm run clean:all

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Cyan
if ($Release) {
    npm run build:production
} else {
    npm run build
}

# Build Windows binaries
Write-Host "🪟 Building Windows binaries..." -ForegroundColor Cyan
if ($CodeSign) {
    Write-Host "🔐 Building with code signing..." -ForegroundColor Yellow
    npm run dist:windows
} else {
    Write-Host "📦 Building without code signing..." -ForegroundColor Yellow
    npm run dist:windows
}

# Run tests if not skipped
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Cyan
    npm test
}

Write-Host "✅ Windows build completed successfully!" -ForegroundColor Green
Write-Host "📁 Artifacts available in: release/" -ForegroundColor Green