# Proof loop (required after every change)
For any task:
1) State the exact files you will change (or commands you will run).
2) Make the change.
3) Prove it with outputs:
   - `git status --porcelain`
   - `git diff --stat`
4) If the goal is CI/CD: include the exact failing log snippet and the fix diff.
If proof fails, stop and fix before continuing.
