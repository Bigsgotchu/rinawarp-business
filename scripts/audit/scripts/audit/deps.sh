#!/usr/bin/env bash
set -euo pipefail

mkdir -p reports

echo "=== Dependency audit & SBOM ==="
node -v
npm -v

echo "-> Installing project deps (ci)"
npm ci

echo "-> npm audit --json"
npm audit --json > reports/npm-audit.json || true

echo "-> depcheck (optional)"
npx --yes depcheck --json > reports/depcheck.json || true

# --- SBOM generation strategy ---
# 1) Try first-party 'npm sbom' (SPDX or CycloneDX) if available (npm >= 9)
# 2) Fallback to CycloneDX's official npm tool: @cyclonedx/cyclonedx-npm
# 3) Fallback to Syft if present (installs quickly via script if not)

SBOM_OUT_JSON="reports/sbom.cyclonedx.json"

generate_with_npm_sbom() {
  echo "-> Attempting: npm sbom (CycloneDX)"
  if npm help sbom >/dev/null 2>&1; then
    npm sbom --format cyclonedx-json > "$SBOM_OUT_JSON"
    echo "SBOM generated via npm sbom at $SBOM_OUT_JSON"
    return 0
  fi
  return 1
}

generate_with_cyclonedx_npm() {
  echo "-> Attempting: @cyclonedx/cyclonedx-npm"
  npx --yes @cyclonedx/cyclonedx-npm --output-format json --output-file "$SBOM_OUT_JSON"
}

generate_with_syft() {
  echo "-> Attempting: syft (Anchore)"
  if ! command -v syft >/dev/null 2>&1; then
    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
  fi
  syft scan dir:. --select-catalogers npm -o cyclonedx-json="$SBOM_OUT_JSON"
}

if ! generate_with_npm_sbom; then
  if ! generate_with_cyclonedx_npm; then
    generate_with_syft
  fi
fi

# Stripe version parity check (example: ^14.22.0)
echo "-> Stripe version parity check"
ROOT_STRIPE=$(jq -r '.dependencies.stripe // .devDependencies.stripe // empty' package.json 2>/dev/null || echo "")
PKG_FILES=$(git ls-files '*package.json' | tr '
' ' ')
MISMATCH=0
for f in $PKG_FILES; do
  v=$(jq -r '.dependencies.stripe // .devDependencies.stripe // empty' "$f" 2>/dev/null || echo "")
  if [ -n "$v" ] && [ -n "$ROOT_STRIPE" ] && [ "$v" != "$ROOT_STRIPE" ]; then
    echo "::warning file=$f::Stripe version ($v) != root ($ROOT_STRIPE)"
    MISMATCH=1
  fi
done
if [ "$MISMATCH" -ne 0 ]; then
  echo "::error::Stripe versions are not consistent across packages."
fi

echo "Deps audit & SBOM complete."
