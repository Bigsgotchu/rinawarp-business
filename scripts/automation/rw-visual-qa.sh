#!/bin/bash
set -e

DOMAIN="https://rinawarptech.com"

echo "============================================="
echo "      👀 RINAWARP VISUAL QA CHECKLIST"
echo "============================================="

cat << CHECKLIST

Open these pages in a desktop browser AND on your phone:

  1) $DOMAIN/
  2) $DOMAIN/terminal-pro
  3) $DOMAIN/music-video-creator
  4) $DOMAIN/pricing
  5) $DOMAIN/download
  6) $DOMAIN/support

For EACH page, verify:

[LAYOUT & THEME]
  ☐ Mermaid theme shows on Terminal Pro (hot pink, coral, teal, black, blue)
  ☐ Unicorn theme shows on Music Video Creator (bright, fun, not childish)
  ☐ Hybrid layout: clean sections + neon accents; not cluttered
  ☐ No weird double footers or duplicate containers
  ☐ Sections have consistent padding and spacing

[TEXT & PRICING]
  ☐ All prices match your current offer (founder wave, lifetime, etc.)
  ☐ No "free trial" language (should say Free Tier if applicable)
  ☐ Copy matches how you actually sell (no fake features)
  ☐ Legal names and company info: "RinaWarp Technologies, LLC" correct

[LEGAL & FOOTERS]
  ☐ Footer visible on every main page
  ☐ Links working: Privacy, Terms, Refund Policy, DMCA
  ☐ Copyright line: "© 2025 RinaWarp Technologies, LLC" present

[INTERACTION & LINKS]
  ☐ All main nav links work and go to the right page
  ☐ Buttons scroll or navigate correctly (no dead buttons)
  ☐ Download page flows into correct CTA (no empty states)
  ☐ No obvious 404s during clicking around

[PERFORMANCE]
  ☐ First load feels snappy (under ~1–2 seconds)
  ☐ Scrolling feels smooth, no big stutters
  ☐ Images look crisp but not slow to load

[RESPONSIVE BEHAVIOR]
  ☐ On mobile: no text runs off the screen
  ☐ Menus are usable (no tiny links)
  ☐ Hero sections still look good on smaller screens

If everything above is ✅, your hybrid theme + deploy is visually GOOD TO GO.

CHECKLIST

echo "============================================="
echo "  ✅ VISUAL QA CHECKLIST READY"
echo "============================================="