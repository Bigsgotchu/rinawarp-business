#!/usr/bin/env bash
set -euo pipefail

# Flags filenames that break Windows Git checkout:
# - contains reserved characters: < > : " / \ | ? *
# - ends with dot or space
# - contains control chars
# - matches reserved device names (CON, PRN, AUX, NUL, COM1.., LPT1..)
python3 - <<'PY'
import re, subprocess, sys

bad = []
names = subprocess.check_output(["git","ls-files","-z"]).decode("utf-8","surrogateescape").split("\0")
reserved = re.compile(r'^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$', re.I)
win_bad_chars = re.compile(r'[<>:"|?*\x00-\x1F]')

for n in names:
    if not n:
        continue
    if win_bad_chars.search(n):
        bad.append((n, "contains reserved/ctrl char"))
        continue
    base = n.split("/")[-1]
    if base.endswith(" ") or base.endswith("."):
        bad.append((n, "ends with space/dot"))
        continue
    if reserved.match(base):
        bad.append((n, "reserved device name"))
        continue

if bad:
    print("❌ Windows checkout breakers found:")
    for n, why in bad:
        print(f" - {n}  [{why}]")
    sys.exit(2)
else:
    print("✅ No Windows checkout breaker filenames found.")
PY
