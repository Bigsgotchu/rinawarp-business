# FEATURES-V1-MUSIC-VIDEO-CREATOR.md
RinaWarp Technologies — AI Music Video Creator (MVC)
Version: 1.0 — Internal Specification Document
Document Type: Feature Master List (V1)

## 1. Product Overview

The RinaWarp Music Video Creator (MVC) is a desktop application built to let artists, creators, and indie musicians generate high-quality AI-powered music videos from:

- Their songs
- Their vocals
- Their branding
- Their RinaWarp Terminal Pro workflows

The purpose of V1 is simple:

Create music videos quickly, professionally, and consistently — without needing video editing skills.

This application is not part of Terminal Pro.
It is a separate product, with its own pricing, own download page, own brand theme, and its own "Unicorn" color palette.

## 2. Branding / Theme Requirements
🦄 Unicorn Theme (NOT pastel, bright neon)

Your brand colors are:

- Hot Pink (#FF1B8D)
- Electric Purple (#A500FF)
- Neon Lime (#00FF8C)
- Electric Blue (#00C8FF)
- Black / Shadow Purple (#0A0A13)

UI Requirements:

- Neon gradients
- Glow effects
- Animated buttons
- Striking "artist-tech" feel
- NOT childish or pastel
- Dark UI base with neon accents

## 3. Application Architecture (High-Level)

### Core Layers

- Frontend (Electron + React or Vite)
- Backend AI Engine (Node.js / Python microservice)
- FFmpeg video processing layer
- Model provider integrations
- Local asset manager (songs, images, logos)
- Export engine for video
- Licensing / Stripe validation layer
- Update system

### Supported OS Targets (V1)

- Linux (AppImage + DEB via Terminal Pro build system)
- Windows (EXE — V1 target)
- macOS (DMG — V1 target)

## 4. V1 Feature Scope

Below is the finalized V1 feature list — everything your app must ship with.

## 5. Music Import & Management
🎵 V1 Features:

- Import MP3, WAV, FLAC
- Auto-detect BPM (basic)
- Detect loudest chorus section (for preview sync)
- Local song library stored in:
  - ~/RinaWarp/MVC/music/
- Drag & drop import
- Track metadata editor
  - Title
  - Artist
  - Album Art (uploaded or auto-generated)

**Future (V2)**
- Auto vocals → stems separation
- Beat-matching for scene transitions

## 6. Prompt-to-Video AI Engine
🎬 Core AI Video Generation

- Users paste a prompt OR choose templates
- Select video style
- Choose video length (15, 30, 45, 60 seconds)
- Auto-cut video to match track dynamics
- Auto-insert beat-timed transitions
- Auto-generate animations based on lyrics (optional)
- Live preview thumbnails
- Render queue with pause/resume
- GPU acceleration if available

### Video Styles Included (V1)

- Neon Cyber-Fantasy
- Rina Vex Dark-Pop style
- Unicorn Neon Graffiti
- Anime Motion Glitch
- Abstract Smoke + Electric Lights
- Liquid Glow Morphs
- Ai-Dreamscape Surreal

## 7. Templates (Ready-to-Use)
V1 Templates:

- "Neon Heartbreak"
- "Liquid Neon Drip"
- "Urban Cyber-Noise"
- "Rina Vex Performer Stage"
- "Graffiti Glow Ballerina"
- "Neon Rain Storm (Channing-style)"
- "Unicorn Lens Flare Explosion"

### User Options:

- Intensity
- Motion Speed
- Color Dominance
- Glitch Level
- Style Variations

## 8. Lyric Overlay Engine

- Line-by-line timed lyric entry
- Sync tool (play song + tap-to-sync)
- Prebuilt lyric styles
- Neon glowing text outlines
- Subtitle export (SRT)
- Font selector (only neon-suitable fonts V1)

## 9. Rina Vex Artist Integration (Cross-Marketing)

YES — this is major.

### Required V1 Functionality:

- Pre-loaded Rina Vex sample track ("For a Minute, Forever" demo clip)
- A "Use This Song" CTA for your music
- A "Preview Rina Vex Music" button inside the app
- A built-in page linking to:
  - https://rinawarptech.com/rina-vex-music
- Special "Rina Vex Style" templates

### UI Requirement:

When the user imports a song, show:

✨ Want a Rina Vex-style video? Choose from 3 exclusive templates inspired by her visual world.

## 10. Export Engine (FFmpeg Layer)
V1 Export Options:

- 1080p (Full HD)
- 720p (Lite)
- MP4 (H.264)
- MOV (Mac-friendly)
- Quick Render (lower quality for preview)
- Final Render (full quality)
- GPU-powered FFmpeg if present
- Export to ~/RinaWarp/MVC/exports/

### V2 Targets:

- 4K
- TikTok 9:16 auto-formatting
- Spotify Canvas 8-second loops

## 11. Licensing (Stripe Integration)
V1 License Tiers:

(Fully matched to website pricing system)

| Tier | Price | Limit | Notes |
|------|-------|-------|-------|
| Free | $0 | Unlimited | Watermark + limited templates |
| Basic | $9.99/mo | Unlimited | No watermark |
| Starter | $29/mo | Unlimited | All core features |
| Creator | $69/mo | Unlimited | Advanced templates |
| Pro | $99/mo | Unlimited | Full access |
| Founder Lifetime | $699 | 200 | All features forever |
| Pioneer Lifetime | $800 | 300 | All features forever |
| Lifetime Future | $999 | Unlimited | Evergreen lifetime |

### In-App Requirements:

- Validate license on startup
- Offline mode with 72h grace period
- stripe-links.js shared across applications
- No hardcoded Stripe links in UI
- Redirect to web checkout, then return user to app

## 12. Settings & Preferences
V1:

- Default export directory
- Cache size limit & cleanup tool
- GPU enable/disable toggle
- Model provider selection (OpenAI / Anthropic / Local)
- Toggle watermark (free tier only)

V2:

- Custom neon color profiles
- Fully modular preset editor

## 13. Local Storage System
Required Directories:

```
~/RinaWarp/MVC/
 ├── music/
 ├── templates/
 ├── cache/
 ├── exports/
 ├── logs/
 └── config.json
```

V1 Must-Haves:

- Logs rotate automatically
- Config.json auto-rewritten on save
- Cache auto-clears every 7 days

## 14. UI Layout (V1)
### App Screens:

- Home Dashboard
- "Create New Video"
- Song Library
- Lyric Sync Tool
- Template Browser
- Render Queue
- Settings
- Rina Vex Music Panel
- Help / Support

### UI Design Requirements:

- Neon shadows
- Animated glow borders
- Smooth tab transitions
- Unicorn-themed gradient buttons
- RinaWarp Infinity logo integration
- No childish visuals — dark, bold neon

## 15. Website Integration Requirements

The desktop app must work seamlessly with the website:

**From the website:**

- /music-video-creator page cross-links back to the app
- Download button points to correct installer
- Pricing strip matches in-app licensing
- Rina Vex cross-promo module visible everywhere

**From the app:**

- "Get More Templates" → opens web page
- "Upgrade License" → opens Stripe checkout
- "Learn More About Rina Vex" → rina-vex-music page
- "Report Issue" → support page

## 16. Telemetry (Privacy First)
V1 Non-negotiable:

- NO personal data collection
- NO song uploads
- All processing is local
- GA4 events ONLY when user initiates:
  - Open template store
  - Click upgrade
  - Download templates

V2:

- Opt-in anonymous performance analytics

## 17. Error Handling System

- Crash reporter (local logs only)
- Fallback renderer preview
- Graceful render queue recovery
- Warnings for:
  - Low disk space
  - Unsupported OS
  - Missing FFmpeg
  - GPU unavailable

## 18. Update System
V1:

- Manual "Check for Updates"
- Checks GitHub Releases or your server
- Auto-download update file (optional)
- Direct link to download page for now
- No forced updates

## 19. Roadmap (V2 & V3 Preview)
V2:

- 4K export
- TikTok vertical mode
- Rina Vex avatar video generator
- Scene switching tied to BPM
- Preset editor
- Multi-track lyric support
- Custom transitions

V3:

- Full music-video timeline editor
- Camera motion AI
- Character-driven videos
- Live performance AI with avatars
- RinaWarp Cloud Render Farm (paid add-on)

## 20. Final Notes

The goal of V1 is this:

Artists can import a song → choose a style → generate a full AI music video with neon cinematics → export → post online.

The RinaWarp Music Video Creator is the flagship artist product for your brand.

Terminal Pro = your dev/automation tool.
MVC = your artist/music marketing tool.

Two separate apps. Two revenue streams. One ecosystem.

✅ FILE COMPLETE.

This is ready to save directly as:

docs/FEATURES-V1-MUSIC-VIDEO-CREATOR.md