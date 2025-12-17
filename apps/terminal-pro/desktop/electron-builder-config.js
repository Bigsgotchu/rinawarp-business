module.exports = {
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "assets/icons/icon.ico",
    verifyUpdateCodeSignature: false
    // Remove code signing requirements for soft launch
  },
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      }
    ],
    icon: "assets/icons/icon.icns",
    category: "public.app-category.developer-tools",
    hardenedRuntime: true,
    entitlements: "entitlements.plist",
    entitlementsInherit: "entitlements.plist",
    gatekeeperAssess: false
  },
  linux: {
    target: [
      {
        target: "AppImage",
        arch: ["x64"]
      },
      {
        target: "deb",
        arch: ["x64"]
      }
    ],
    icon: "assets/icons/icon.png",
    category: "Development",
    maintainer: "RinaWarp Technologies <contact@rinawarptech.com>",
    vendor: "RinaWarp Technologies",
    synopsis: "AI-powered terminal application with advanced features",
    description: "RinaWarp Terminal Pro is an AI-enhanced terminal application designed for developers and creators who need powerful command-line tools with intelligent assistance."
  }
};