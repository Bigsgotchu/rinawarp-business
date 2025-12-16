import { run } from '../lib/exec.js';

export function types() {
  console.log('\n📘 Type Checking All Services\n');

  run('npx tsc -p tsconfig.json --noEmit');
  run('npx tsc -p services/api/tsconfig.json --noEmit');
  run('npx tsc -p services/gateway/tsconfig.json --noEmit');
  run('npx tsc -p services/auth-service/tsconfig.json --noEmit');

  console.log('\n✔ All TS projects type-checked.\n');
}
