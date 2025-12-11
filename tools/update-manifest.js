#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const version = process.argv[2];

if (!version) {
  console.error("Usage: node update-manifest.js <version>");
  console.error("Example: node update-manifest.js 0.9.0");
  process.exit(1);
}

const manifest = {
  version: version,
  releaseDate: new Date().toISOString().split("T")[0],
  notes: `Terminal Pro Soft Launch - Version ${version}`,
  downloads: {
    windows: {
      zip: `https://downloads.rinawarptech.com/terminal-pro/${version}/RinaWarp-Terminal-Pro-Windows.zip`,
      exe: `https://downloads.rinawarptech.com/terminal-pro/${version}/RinaWarp-Terminal-Pro-Windows.exe`
    },
    linux: {
      appImage: `https://downloads.rinawarptech.com/terminal-pro/${version}/RinaWarp-Terminal-Pro-Linux.AppImage`,
      deb: `https://downloads.rinawarptech.com/terminal-pro/${version}/RinaWarp-Terminal-Pro-Linux.deb`
    },
    macos: {
      status: "coming-soon",
      expected: "2025-12-12",
      note: "macOS build requires Apple signing and will be available within 48 hours",
      placeholder: `https://downloads.rinawarptech.com/terminal-pro/${version}/RinaWarp-Terminal-Pro-MacOS.txt`
    }
  },
  systemRequirements: {
    windows: "Windows 10/11 (64-bit), 4GB RAM, 500MB disk space",
    linux: "Modern distribution (Ubuntu 20.04+, Fedora 35+), 4GB RAM, 500MB disk space",
    macos: "macOS 11.0+ (Big Sur or later), 4GB RAM, 500MB disk space"
  },
  features: [
    "AI-powered terminal with Rina co-worker",
    "Basic command suggestions and autocompletion",
    "Multi-tab terminal interface",
    "Customizable themes and appearance",
    "Built-in file navigation and management",
    "Session persistence and history",
    "Basic @rina diagnostic commands",
    "Soft launch branding and version tagging",
    "Feedback system integration",
    "Usage limits with daily reset"
  ],
  knownIssues: [
    "Windows installer is portable ZIP only (full installer coming soon)",
    "macOS version not yet available",
    "Some AI features may have occasional latency",
    "Theme customization may require app restart",
    "Linux Snap package may need manual connection for some interfaces",
    "Feedback upload may show success before completion",
    "@rina status commands are in early beta"
  ],
  support: {
    email: "support@rinawarptech.com",
    feedback: "feedback@rinawarptech.com",
    diagnosticCommands: [
      "@rina status",
      "@rina diagnostics",
      "@rina feedback",
      "@rina crashlog"
    ],
    responseTime: "Typically within 24 hours during soft launch"
  }
};

// Ensure the public-downloads directory exists
const dirPath = path.join(__dirname, "..", "public-downloads");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Write the manifest file
const manifestPath = path.join(dirPath, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log("✅ Updated manifest successfully!");
console.log(`📋 Version: ${version}`);
console.log(`📁 Location: ${manifestPath}`);
console.log("");
console.log("📊 Manifest includes:");
console.log("  • Version & release date");
console.log("  • Download URLs for all platforms");
console.log("  • System requirements");
console.log("  • Feature list");
console.log("  • Known issues");
console.log("  • Support information");