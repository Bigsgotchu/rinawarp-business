# Ground truth rule (no more loops)
- Never claim something is "done" unless you can show proof from the workspace or a command output.
- If you edited files: you MUST run and report:
  - `git status --porcelain`
  - `git diff --stat`
- If you claim a URL works: you MUST run and report:
  - `curl -sI <url> | sed -n '1,25p'`
- If you claim a build artifact exists: you MUST run and report:
  - `ls -la <path>` or `find <dir> -maxdepth N -type f | head`
