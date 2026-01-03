# Command safety + action policy
Allowed without asking (safe):
- read-only: ls, cat, sed, grep, find, git status/diff/log, curl -I, npm ci/install, npm run build, node scripts/*
Allowed but MUST show output:
- aws s3 ls/cp/sync (only within terminal-pro/<channel>/)
- wrangler deploy (only in workers/download-proxy)
Blocked unless you explicitly approve:
- git filter-branch/filter-repo, force pushes
- rm -rf outside repo
- anything touching ~/.ssh, ~/.aws, ~/.config unless requested
