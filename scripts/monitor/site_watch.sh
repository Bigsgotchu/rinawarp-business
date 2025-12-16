#!/usr/bin/env bash
set -euo pipefail

SITE_BASE="${SITE_BASE:-https://rinawarptech.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"     # optional
GITHUB_TOKEN="${GITHUB_TOKEN:-}"        # optional (for issues)
REPO="${GITHUB_REPOSITORY:-}"           # owner/repo in Actions, else set manually

now_iso="$(date -Is)"
fail_msgs=()

jstatus="$(curl -fsS "$SITE_BASE/status.json" || true)"
if [[ -z "$jstatus" ]] || ! echo "$jstatus" | grep -q '"ok":true'; then
  fail_msgs+=("status.json not OK or unreachable")
fi

jprices="$(curl -fsS "$SITE_BASE/api/stripe/prices?_=$(date +%s)" || true)"
if [[ -z "$jprices" ]] || ! echo "$jprices" | grep -q '"data"'; then
  fail_msgs+=("stripe prices endpoint failed")
else
  # Require at least one price and prefer monthly+annual presence
  cnt="$(echo "$jprices" | jq -r '.data|length' 2>/dev/null || echo 0)"
  if [[ "${cnt:-0}" -lt 1 ]]; then
    fail_msgs+=("stripe prices returned 0 items")
  else
    # Soft check: look for month/year intervals
    has_m="$(echo "$jprices" | jq -r '.data[]?.recurring?.interval' 2>/dev/null | grep -c '^month$' || true)"
    has_y="$(echo "$jprices" | jq -r '.data[]?.recurring?.interval' 2>/dev/null | grep -c '^year$' || true)"
    [[ "$has_m" -ge 1 ]] || fail_msgs+=("monthly price missing")
    [[ "$has_y" -ge 1 ]] || fail_msgs+=("annual price missing")
  fi
fi

if [[ "${#fail_msgs[@]}" -eq 0 ]]; then
  echo "OK ${now_iso}"
  exit 0
fi

# Build message
msg="RinaWarp monitor FAILED at ${now_iso}\nSite: ${SITE_BASE}\n- $(printf '%s\n- ' "${fail_msgs[@]}")"
echo -e "$msg"

# Slack (optional)
if [[ -n "$SLACK_WEBHOOK" ]]; then
  curl -fsS -X POST -H 'content-type: application/json' \
    --data "{\"text\": $(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))') }" \
    "$SLACK_WEBHOOK" || true
fi

# GitHub Issue (optional, creates or comments)
if [[ -n "$GITHUB_TOKEN" && -n "$REPO" ]]; then
  title="Site monitor failed: $(date +'%Y-%m-%d %H:%M %Z')"
  body="### Monitor Failure\n\n- Site: ${SITE_BASE}\n- Time: ${now_iso}\n\n**Errors**:\n$(printf -- '* %s\n' "${fail_msgs[@]}")\n"
  api="https://api.github.com/repos/${REPO}/issues"
  curl -fsS -H "authorization: Bearer ${GITHUB_TOKEN}" -H 'content-type: application/json' \
    -d "{\"title\": $(printf '%s' "$title" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'), \"body\": $(printf '%s' "$body" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))') }" \
    "$api" || true
fi

exit 1
