# SmartScreen Warning - FAQ Copy (Official Response)

**Use this verbatim for user support and documentation**

## ❓ Why does Windows show a SmartScreen warning?

### Short answer:

Because RinaWarp Terminal Pro is a new developer tool, not because it's unsafe.

### Long answer:

Windows SmartScreen uses reputation, not virus detection. New apps — especially developer tools distributed outside the Microsoft Store — start with zero reputation.

RinaWarp Terminal Pro is:

- ✅ Code-signed with valid certificate
- ✅ Not obfuscated
- ✅ Not bundled with unwanted installers
- ✅ Not collecting telemetry
- ✅ Open about its architecture and limitations

As more developers install and use it, the warning disappears automatically.

## ✅ How to run it anyway

1. Click **"More info"**
2. Click **"Run anyway"**

That's it — no system changes are made.

We ship a portable executable so you can inspect, scan, or sandbox it yourself.

## 🔒 Security Transparency

You can verify the digital signature by right-clicking the file → Properties → Digital Signatures.

## 📊 Developer-Friendly Approach

**Portable ZIP Distribution:**

- Zero installer friction
- Devs can inspect the executable
- No admin privileges required
- Perfect for Show HN / Reddit distribution
- Works in isolated environments

**What you get:**

```
RinaWarp-Terminal-Pro-v1.0.0-Windows.zip
└── RinaWarp Terminal Pro.exe (176MB)
```

## 🚀 Professional Standards

This approach follows industry best practices:

1. **Code Signing**: Valid Authenticode certificate
2. **Portable Distribution**: No installer dependencies
3. **Transparency**: Open architecture documentation
4. **Developer Trust**: Built for the terminal community

## 📞 Support Response Template

If users ask about SmartScreen warnings:

```
"The warning is normal for new developer tools. RinaWarp Terminal Pro is code-signed and safe to run. Click 'More info' then 'Run anyway' - no system changes are made. You can verify the digital signature in file properties."
```

---

**Note:** EV certificates provide faster SmartScreen reputation building, but even OV certificates work effectively over time. The portable ZIP approach bypasses many installer-related concerns entirely.
