#!/usr/bin/env bash
# ===========================================================
# RinaWarp Suite Launcher - Unified Control Script
# ===========================================================

echo "🚀 Launching RinaWarp Suite..."

# Base directory (adjust if you moved the projects)
BASE_DIR="$HOME/Documents/Rinawarp-Platforms/working-apps"

# Helper function
launch_app() {
  local app_name="$1"
  local app_path="$2"

  if [ -f "$app_path" ]; then
    echo "🖥️  Launching $app_name..."
    xdg-open "$app_path" >/dev/null 2>&1 &
  else
    echo "⚠️  Could not find $app_path"
  fi
}

# Launch each RinaWarp app
launch_app "RinaWarp Phone Manager" "$BASE_DIR/RinaWarp-Phone-Manager/index.html"
launch_app "RinaWarp Terminal Pro" "$BASE_DIR/RinaWarp-Terminal-Pro/index.html"
launch_app "RinaWarp Music Video Creator" "$BASE_DIR/RinaWarp-Music-Video-Creator/index.html"

echo "✅ All RinaWarp apps launched!"
echo "💡 Tip: Close apps manually or run 'pkill firefox' / 'pkill chromium' to stop browser instances."