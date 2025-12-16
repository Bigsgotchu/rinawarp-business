import { run } from '../lib/exec.js';

export function audit() {
  console.log('\n🛡 Dependency Audit\n');
  run('npm audit --audit-level=moderate');
  console.log('\n✔ Dependency scan complete.\n');
}
