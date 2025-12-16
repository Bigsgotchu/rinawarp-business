import { run } from '../lib/exec.js';

export function docs() {
  console.log('\n📚 Generating Documentation\n');
  run('npx typedoc --out docs ./');
  console.log('\n✔ Docs generated in /docs.\n');
}
