# FEATURES-V1-MVC.md
RinaWarp Music Video Creator – Version 1.0 Feature Specification

## 🎯 0. Overview

RinaWarp Music Video Creator (MVC) is a standalone desktop application designed to:

- Convert songs into AI-generated music videos
- Provide creators visual tools that pair perfectly with their audio
- Integrate directly with your Rina Vex music so the products promote each other
- Deliver fast export, high-control workflows, and platform-optimized output

## 1. CORE APP FEATURES (Required for v1.0)

### ✅ 1.1 Project System

- Create new MVC project
- Drag-and-drop audio file
- Auto-import metadata (title / BPM / duration)
- Project auto-save
- Project folder structure:

```
/projectname/
   audio/
   prompts/
   renders/
   thumbnails/
   metadata.json
```

## 2. AI VIDEO ENGINE FEATURES

### 🎥 2.1 AI Scene Generator

Automatic scene creation from:

- Lyrics
- Mood
- Genre
- BPM

Adjustable "Scene Density" options:

- Light (3–5 scenes)
- Standard (6–12 scenes)
- Intense (15–30 scenes)

### 🎨 2.2 Prompt Composer

Structured prompt UI:

- Style
- Camera movement
- Character
- Environment
- Color palette
- Motion intensity

**Presets:**

- Neon RinaWarp
- Dark-Pop Rina Vex
- Anime / Realistic / Cinematic
- Graffiti Street Visuals
- Mermaid Neon Glow

### 📐 2.3 Visual Sync Engine

Syncs scene transitions to:

- Beat-drops
- Chorus
- Verse changes
- BPM-synced visual pulses

Automatic camera shake on snares (optional toggle)

## 3. RENDERING PIPELINE

### 🖥️ 3.1 Export Options

- 720p (fast), 1080p, 4K
- MP4 H.264
- WebM VP9

**Export presets:**

- TikTok portrait
- YouTube 16:9
- Instagram reel 9:16
- Square 1:1

### 🔥 3.2 Render Queue

- Add multiple renders
- Background rendering
- Render notifications

### 📸 3.3 Thumbnail Generator

- Auto-generate 12 thumbnails
- Neon overlay option
- Title text overlay with:
  - Rina Vex font style
  - Bold / glow modes

## 4. AUDIO FEATURES

### 🎵 4.1 Audio Import

- Formats: MP3, WAV, FLAC, M4A
- Auto waveform visualization
- Loudness normalization
- BPM detection
- Key detection

### 🎚️ 4.2 Audio Markers

- Verses
- Chorus
- Drops
- Beat peaks

## 5. USER INTERFACE FEATURES

### 🧭 5.1 Layout

- Left: Scenes timeline
- Center: Video preview
- Right: Prompt controls
- Bottom: Audio waveform timeline

### 🌈 5.2 Theme

- "Unicorn Glow" theme
- Neon gradients
- RinaWarp-style buttons
- Dark-mode only for v1

## 6. FILE MANAGEMENT

### 📂 6.1 Import System

- Import your music folder
- Auto-detect new tracks
- Auto-add metadata

### 📤 6.2 Export System

Save to:

- Desktop
- Movies folder
- Custom folder

Automatic export versioning:

- MySong-Video-v1.mp4
- MySong-Video-v2.mp4

## 7. RINAWARP + RINA VEX INTEGRATION

### 💽 7.1 Built-in Rina Vex Music Library

Read-only folder:

```
app/music/rinavex/
```

**Pre-loaded tracks:**

- "For a Minute, Forever"
- "Silent Storm"
- "Unwritten Pages"

Add more anytime

One-click:

"Generate Music Video from this Track"

### 🔗 7.2 Cross-promotion Integration

Export pages link back to album

In-app links to:

- RinaWarp website
- Rina Vex Spotify
- Rina Vex YouTube

## 8. PERFORMANCE & OPTIMIZATION

### ⚡ 8.1 Speed Improvements

- GPU acceleration
- Preloading video models
- Async scene generation
- Memory-safe temporary file handling

### 🛡️ 8.2 Stability

- Render crash recovery
- Autosave every 45 seconds
- Background sync to project file

## 9. SECURITY & SAFETY

### 🔒 9.1 Privacy

- No cloud storage
- All video generation local or via your selected AI API key
- API keys encrypted locally

### 🔐 9.2 API Providers

Supported providers (toggleable):

- OpenAI
- RunDiffusion
- Stability
- RinaWarp Custom Model (future)

## 10. PLATFORM RELEASE REQUIREMENTS

### 🐧 Linux

- AppImage
- DEB (future)

### 🪟 Windows

- Portable executable
- Installer (future)

### 🍎 macOS

- DMG (v1.1)
- Signed + notarized (future)

## 11. VERSION TAGGING

**Version:** 1.0.0
**Codename:** "Neon Muse"
**Status:** Active Build Target

## 12. DONE WHEN (Definition of Done)

A feature is considered done when:

- It exists
- It is visible
- It works
- It survives app restart
- It renders a video without crashing
- It appears in the final export

---

**END OF FILE**