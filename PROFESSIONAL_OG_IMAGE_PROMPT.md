# Professional OG Image Generation Prompt

## Required Specifications
- **Dimensions**: 1200 × 630 pixels (1.91:1 aspect ratio)
- **Format**: PNG or JPG (PNG preferred for quality)
- **File Size**: Under 1MB
- **Style**: Professional, trustworthy, tech-focused

## Design Prompt

**Create an Open Graph image for RinaWarp Terminal Pro with the following elements:**

### Background
- Dark professional gradient (deep blue to purple)
- Subtle tech pattern or grid overlay
- Clean, modern aesthetic

### Logo & Branding
- RinaWarp logo prominently displayed (use existing SVG if available)
- Tagline: "AI-Powered Terminal for Developers"
- Professional typography (Inter or similar sans-serif)

### Visual Elements
- Terminal/command line interface mockup
- AI assistant avatar or icon
- Code snippets or terminal output
- Subtle glows and highlights for tech feel

### Color Scheme
- Primary: #6366f1 (Indigo)
- Accent: #06b6d4 (Cyan)
- Text: White/light gray on dark background
- Secondary: #10b981 (Emerald) for success elements

### Layout
- Logo top-left or centered
- Tagline below logo
- Visual elements balanced, not cluttered
- Ample white space
- Professional spacing and alignment

### Text Hierarchy
- Main title: "RinaWarp Terminal Pro"
- Subtitle: "AI-Powered Terminal for Developers"
- Optional: "Professional • Reliable • Intelligent"

## Generation Instructions

### Using AI Image Generators
1. **Midjourney/DALL-E**: Use detailed prompt above
2. **Canva**: Use "Social Media" → "Open Graph" template
3. **Figma/Photoshop**: Manual creation with assets

### Key Elements to Include
- [ ] RinaWarp branding
- [ ] Terminal interface
- [ ] AI elements
- [ ] Professional color scheme
- [ ] Clear typography
- [ ] Balanced composition

## File Naming & Placement
- **Filename**: `og-image.png` or `og-image-professional.png`
- **Location**: `/assets/og-image.png`
- **Backup**: Keep current og-image.png as fallback

## HTML Implementation

Add to `<head>` section:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://rinawarptech.com/">
<meta property="og:title" content="RinaWarp Terminal Pro - AI-Powered Terminal for Developers">
<meta property="og:description" content="Professional terminal with AI assistance. Boost productivity with intelligent code completion, automated workflows, and smart suggestions.">
<meta property="og:image" content="https://rinawarptech.com/assets/og-image.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://rinawarptech.com/">
<meta property="twitter:title" content="RinaWarp Terminal Pro - AI-Powered Terminal for Developers">
<meta property="twitter:description" content="Professional terminal with AI assistance. Boost productivity with intelligent code completion, automated workflows, and smart suggestions.">
<meta property="twitter:image" content="https://rinawarptech.com/assets/og-image.png">
```

## Testing

### Validation Tools
- [ ] Open Graph checker: opengraph.xyz
- [ ] Facebook debugger: developers.facebook.com/tools/debug
- [ ] Twitter card validator: cards-dev.twitter.com/validator

### Social Media Preview
- [ ] Facebook link preview
- [ ] Twitter link preview
- [ ] LinkedIn link preview
- [ ] Discord link preview

## Fallback Strategy

If professional OG image isn't ready:
- Use current og-image.png
- Ensure proper meta tags are in place
- Test with validators
- Update description for better engagement

## Priority Level
- **High**: Implement before launch
- **Impact**: Affects social media sharing and first impressions
- **Timeline**: 1-2 hours to generate and implement