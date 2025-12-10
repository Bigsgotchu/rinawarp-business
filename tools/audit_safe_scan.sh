#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# SAFE MODE AUDIT SCAN
#
# - READ-ONLY: Does not move, delete, or modify source trees.
# - Compares old codebase vs new monorepo.
# - Generates reports under: $NEW_ROOT/audit/<timestamp>/
# - Focuses on code/config docs; ignores node_modules/dist/build/etc.
#
# You can customise OLD_ROOT/NEW_ROOT below if needed.
###############################################################################

# --- CONFIGURE THESE IF YOUR PATHS ARE DIFFERENT -----------------------------

NEW_ROOT="${NEW_ROOT:-$HOME/Documents/rinawarp-business}"
OLD_ROOT="${OLD_ROOT:-$HOME/Documents/RinaWarp}"

# File extensions considered "interesting" source/config/docs
CODE_EXTS=("js" "jsx" "ts" "tsx" "mjs" "cjs"
           "json" "yml" "yaml" "toml" "env" "conf"
           "py" "rs" "sh" "bash" "zsh"
           "html" "css" "md" "mdx")

# Directories to ignore in both trees (add more if you like)
IGNORED_DIRS=("node_modules" "dist" "build" ".git" ".hg" ".svn"
              ".next" ".cache" "coverage" "__pycache__"
              "venv" ".venv" "env" "target" ".turbo")

###############################################################################
# Helper: build find prune expression
###############################################################################
build_prune_expr() {
  local expr=""
  for d in "${IGNORED_DIRS[@]}"; do
    if [[ -n "$expr" ]]; then
      expr+=" -o "
    fi
    expr+="-name $d"
  done
  printf '( %s ) -prune' "$expr"
}

PRUNE_EXPR="$(build_prune_expr)"

timestamp="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$NEW_ROOT/audit/$timestamp"

mkdir -p "$REPORT_DIR"

echo "=== SAFE MODE AUDIT SCAN ==="
echo "OLD_ROOT: $OLD_ROOT"
echo "NEW_ROOT: $NEW_ROOT"
echo "REPORT_DIR: $REPORT_DIR"
echo

###############################################################################
# 1. Generate file lists (relative paths) for OLD and NEW
###############################################################################
echo "[1/5] Building file lists (ignoring heavy dirs)..."

old_list="$REPORT_DIR/old_files.txt"
new_list="$REPORT_DIR/new_files.txt"

# Old repo file list
# shellcheck disable=SC2086
find "$OLD_ROOT" $PRUNE_EXPR -o -type f -print0 \
  | sed -z "s|$OLD_ROOT/||" \
  | tr '\0' '\n' \
  | sort > "$old_list"

# New repo file list
# shellcheck disable=SC2086
find "$NEW_ROOT" $PRUNE_EXPR -o -type f -print0 \
  | sed -z "s|$NEW_ROOT/||" \
  | tr '\0' '\n' \
  | sort > "$new_list"

echo "  - Old file list: $old_list"
echo "  - New file list: $new_list"
echo

###############################################################################
# 2. Path-based comparison
###############################################################################
echo "[2/5] Comparing by relative path..."

only_in_old_by_path="$REPORT_DIR/only_in_old_by_path.txt"
only_in_new_by_path="$REPORT_DIR/only_in_new_by_path.txt"

comm -23 "$old_list" "$new_list" > "$only_in_old_by_path"
comm -13 "$old_list" "$new_list" > "$only_in_new_by_path"

echo "  - Paths ONLY in OLD: $only_in_old_by_path"
echo "  - Paths ONLY in NEW: $only_in_new_by_path"

# Top-level summary
awk -F/ '{print $1}' "$only_in_old_by_path" | sort | uniq -c | sort -nr \
  > "$REPORT_DIR/summary_only_in_old_top_level.txt"

echo "  - Summary (top-level dirs only): $REPORT_DIR/summary_only_in_old_top_level.txt"
echo

###############################################################################
# 3. Content-based comparison (hashes of code-like files)
###############################################################################
echo "[3/5] Comparing by file contents (hashes for code/config/docs)..."

old_hashes="$REPORT_DIR/old_hashes.txt"
new_hashes="$REPORT_DIR/new_hashes.txt"

is_code_ext() {
  local filename="$1"
  local ext="${filename##*.}"
  for e in "${CODE_EXTS[@]}"; do
    if [[ "$ext" == "$e" ]]; then
      return 0
    fi
  done
  return 1
}

echo "  - Hashing OLD repo code files..."
> "$old_hashes"
while IFS= read -r rel; do
  if is_code_ext "$rel"; then
    local_path="$OLD_ROOT/$rel"
    # Ignore if somehow disappeared between scans
    [[ -f "$local_path" ]] || continue
    sha1=$(sha1sum "$local_path" | awk '{print $1}')
    size=$(stat -c%s "$local_path" 2>/dev/null || echo 0)
    printf "%s %s %s\n" "$sha1" "$size" "$rel" >> "$old_hashes"
  fi
done < "$old_list"

echo "  - Hashing NEW repo code files..."
> "$new_hashes"
while IFS= read -r rel; do
  if is_code_ext "$rel"; then
    local_path="$NEW_ROOT/$rel"
    [[ -f "$local_path" ]] || continue
    sha1=$(sha1sum "$local_path" | awk '{print $1}')
    size=$(stat -c%s "$local_path" 2>/dev/null || echo 0)
    printf "%s %s %s\n" "$sha1" "$size" "$rel" >> "$new_hashes"
  fi
done < "$new_list"

echo "  - Old hashes: $old_hashes"
echo "  - New hashes: $new_hashes"

# Unique hash sets
old_hash_only="$REPORT_DIR/old_hashes_only.txt"
new_hash_only="$REPORT_DIR/new_hashes_only.txt"
cut -d' ' -f1 "$old_hashes" | sort -u > "$old_hash_only"
cut -d' ' -f1 "$new_hashes" | sort -u > "$new_hash_only"

hashes_only_in_old="$REPORT_DIR/hashes_only_in_old.txt"
comm -23 "$old_hash_only" "$new_hash_only" > "$hashes_only_in_old"

echo "  - Hashes ONLY in OLD: $hashes_only_in_old"

# Map these hashes back to files
only_in_old_by_hash="$REPORT_DIR/only_in_old_by_hash.txt"
grep -Ff "$hashes_only_in_old" "$old_hashes" | sort > "$only_in_old_by_hash"

echo "  - Files whose CONTENT only exists in OLD (by hash): $only_in_old_by_hash"
echo

###############################################################################
# 4. Detect internal duplicates in OLD (possible redundant copies)
###############################################################################
echo "[4/5] Finding duplicate content inside OLD repo (same hash multiple paths)..."

dups_in_old="$REPORT_DIR/duplicates_in_old_by_hash.txt"
awk '{print $1}' "$old_hashes" | sort | uniq -d > "$REPORT_DIR/_tmp_dup_hashes_old.txt" || true

if [[ -s "$REPORT_DIR/_tmp_dup_hashes_old.txt" ]]; then
  grep -Ff "$REPORT_DIR/_tmp_dup_hashes_old.txt" "$old_hashes" \
    | sort > "$dups_in_old"
  echo "  - Internal duplicates in OLD: $dups_in_old"
else
  echo "  - No internal duplicates detected in OLD by content hash."
fi

rm -f "$REPORT_DIR/_tmp_dup_hashes_old.txt"
echo

###############################################################################
# 5. Generate a DRY-RUN migration script (COMMENTED cp commands)
###############################################################################
echo "[5/5] Generating DRY-RUN migration suggestions..."

dry_run_script="$REPORT_DIR/dry_run_migration_commands.sh"
{
  echo "#!/usr/bin/env bash"
  echo "#"
  echo "# DRY RUN ONLY — ALL COMMANDS ARE COMMENTED OUT."
  echo "# These are SUGGESTED cp -a commands for files/content that appear to"
  echo "# exist ONLY in the OLD repo (no content match in NEW)."
  echo "#"
  echo "# Review carefully before uncommenting anything."
  echo
  echo "OLD_ROOT=\"$OLD_ROOT\""
  echo "NEW_ROOT=\"$NEW_ROOT\""
  echo

  # From content-only-diff, generate suggested copy commands.
  # Format of only_in_old_by_hash: <hash> <size> <relpath>
  awk '{print $3}' "$only_in_old_by_hash" | sort | uniq | while IFS= read -r rel; do
    # Skip obvious build artifacts or logs by simple heuristics
    case "$rel" in
      *".log" | *".tmp" | *"/logs/"* | *"/coverage/"* )
        continue
        ;;
    esac
    src="\$OLD_ROOT/$rel"
    dest_dir="\$NEW_ROOT/$(dirname "$rel")"
    echo "# mkdir -p \"$dest_dir\""
    echo "# cp -a \"$src\" \"$dest_dir/\""
    echo
  done
} > "$dry_run_script"

chmod +x "$dry_run_script"

echo "  - DRY RUN script (all commands commented): $dry_run_script"
echo
echo "=== DONE ==="
echo "All reports live under: $REPORT_DIR"
echo "Nothing was moved or modified."