#!/usr/bin/env node

// Purpose: Single entry to ship reliably from dev machines or CI.
// Pipeline: cleanup → quality gates → build → packaged smoke → publish

import { spawnSync } from 'node:child_process'

function run(cmd, args, opts = {}) {
  console.log(`\n== ${cmd} ${args.join(' ')} =====================================================`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if ((r.status ?? 0) !== 0) {
    console.error(`❌ ${cmd} ${args.join(' ')} failed with exit code ${r.status}`)
    process.exit(r.status ?? 1)
  }
}

function runOptional(cmd, args, opts = {}) {
  console.log(`\n== ${cmd} ${args.join(' ')} (optional) ========================================`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if ((r.status ?? 0) !== 0) {
    console.warn(`⚠️  ${cmd} ${args.join(' ')} failed with exit code ${r.status} (continuing)`)
  }
}

try {
  console.log('🚀 Starting ship pipeline...')
  
  // Step 1: Cleanup repository
  console.log('\n🧹 Step 1: Repository cleanup')
  run('pnpm', ['-s', 'repo:cleanup'])
  
  // Step 2: Quality gates
  console.log('\n✅ Step 2: Quality gates')
  run('pnpm', ['-s', 'quality:check'])
  run('pnpm', ['-s', 'smoke:preload'])
  
  // Step 3: Build Electron app
  console.log('\n🔨 Step 3: Electron build')
  runOptional('pnpm', ['-s', 'release:dry']) // Optional guard if you have it
  run('pnpm', ['-w', '--filter', './apps/terminal-pro/desktop', 'build'])
  
  // Step 4: Packaged smoke test
  console.log('\n💨 Step 4: Packaged smoke test')
  run('pnpm', ['-s', 'smoke:preload:packaged'])
  
  // Step 5: Publish (only in CI with proper environment)
  if (process.env.CI && process.env.GITHUB_TOKEN) {
    console.log('\n📦 Step 5: Publish to GitHub Releases')
    run('pnpm', ['-s', 'release:tag'])
    run('pnpm', ['-w', '--filter', './apps/terminal-pro/desktop', 'release:atomic'])
  } else {
    console.log('\n⏭️  Step 5: Publish (skipped - not in CI or no GITHUB_TOKEN)')
    console.log('💡 To publish: git tag vX.Y.Z && git push --tags')
  }
  
  console.log('\n🎉 Ship pipeline completed successfully!')
  console.log('\n📝 Next steps:')
  console.log('   • Create changeset: pnpm changeset')
  console.log('   • Version packages: pnpm version')
  console.log('   • Tag release: pnpm release:tag')
  console.log('   • Or simply: git tag vX.Y.Z && git push --tags')
  
} catch (error) {
  console.error('\n💥 Ship pipeline failed:', error?.message || error)
  process.exit(1)
}