import { run } from '../lib/exec.js';

export function release() {
  console.log('\n🚀 Creating Release\n');

  run('npm version patch');
  run("git add . && git commit -m 'release: automated update'");
  run("git tag -a v$(node -p \"require('./package.json').version\") -m 'Auto Release'");
  run('git push && git push --tags');

  console.log('\n✔ Release created and pushed.\n');
}
