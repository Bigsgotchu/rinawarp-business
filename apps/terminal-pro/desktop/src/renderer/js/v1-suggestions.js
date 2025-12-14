/**
 * V1 Suggestions - Hardcoded suggestion map for immediate value delivery
 * Covers 80% of dev muscle memory without AI dependency
 */

export function getV1Suggestion(command) {
  if (!command) return null;

  const c = command.trim();

  const MAP = [
    // Git
    [/^git status$/, 'git diff'],
    [/^git diff$/, 'git commit -am ""'],
    [/^git commit/, 'git push'],
    [/^git clone/, 'cd <repo>'],
    [/^git pull$/, 'git status'],
    [/^git add/, 'git commit -m ""'],

    // Node / JS
    [/^npm install$/, 'npm run dev'],
    [/^npm run dev$/, 'npm run build'],
    [/^npm test$/, 'npm run build'],
    [/^node index\.js$/, 'npm test'],
    [/^yarn install$/, 'yarn dev'],
    [/^yarn dev$/, 'yarn build'],
    [/^pnpm install$/, 'pnpm dev'],
    [/^pnpm dev$/, 'pnpm build'],

    // FS / Shell
    [/^cd .+$/, 'ls'],
    [/^ls$/, 'pwd'],
    [/^pwd$/, 'ls -la'],

    // Docker
    [/^docker build/, 'docker run'],
    [/^docker run/, 'docker ps'],
    [/^docker ps$/, 'docker logs'],

    // Package managers
    [/^apt update$/, 'apt upgrade'],
    [/^brew update$/, 'brew upgrade'],
    [/^pip install/, 'pip freeze'],

    // Python
    [/^python3 -m venv/, 'source venv/bin/activate'],
    [/^pip install/, 'pip freeze'],

    // Safety net - avoid dangerous commands
    [/^rm -rf/, null],
    [/^sudo rm/, null],
    [/^format/, null],
  ];

  for (const [regex, suggestion] of MAP) {
    if (regex.test(c)) return suggestion;
  }

  return null;
}
