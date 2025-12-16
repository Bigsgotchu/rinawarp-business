#!/usr/bin/env node

import chalk from 'chalk';

function showHelp() {
  console.log(chalk.cyan('\nRinaWarp CLI — Usage:'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(
    chalk.green(
      'rw scan                 Scan repository for missing files, dist folders, and misconfigurations',
    ),
  );
  console.log(chalk.green('rw scan --fix           Auto-repair missing files and folders'));
  console.log(
    chalk.green('rw verify               Verify post-deploy health (website, API, auth)'),
  );
  console.log(chalk.green('rw build [target]       Build applications (site, terminal, api, all)'));
  console.log(
    chalk.green('rw deploy [target]      Deploy to production (site, terminal, api, all)'),
  );
  console.log(chalk.green('rw doctor               Deep system diagnostic'));
  console.log(
    chalk.green('rw generate [type] [name] Generate scaffolding (page, component, service)'),
  );
  console.log(
    chalk.green('rw dev [target]         Start dev server (site, terminal, api, gateway, auth)'),
  );
  console.log(chalk.green('rw logs [target]        View logs (api, gateway, auth, pm2, site)'));
  console.log(chalk.green('rw env                  Validate required env vars'));
  console.log(chalk.green('rw publish terminal     Build & package Terminal installers'));
  console.log(chalk.green('rw lint-prompt <text>   Lint prompt for potential issues'));
  console.log(chalk.green('rw expand <task>        Expand task into atomic steps'));
  console.log(chalk.green('rw inspect              Inspect repository for code issues'));
  console.log(chalk.green('rw style                Enforce code style formatting'));
  console.log(chalk.green('rw types                Type check all services'));
  console.log(chalk.green('rw audit                Audit dependencies for security'));
  console.log(chalk.green('rw testgen <name>       Generate test scaffolding'));
  console.log(chalk.green('rw test-ai              Test AI integration endpoints'));
  console.log(chalk.green('rw blueprint            Generate architecture blueprint'));
  console.log(chalk.green('rw release              Create release with auto-tagging'));
  console.log(chalk.green('rw docs                 Generate documentation'));
  console.log(chalk.green('rw flows                Map data flows'));
  console.log(chalk.green('rw simulate             Simulate agent behavior'));
  console.log(chalk.green('rw help                 Show this help message'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];
const sub = args[1];
const extra = args[2];

switch (command) {
  case 'scan':
    if (sub === '--fix') {
      import('./commands/scan.js').then((m) => m.scanFix());
    } else {
      import('./commands/scan.js').then((m) => m.scanRepo());
    }
    break;

  case 'verify':
    import('./commands/verify.js'); // your existing script runs on import
    break;

  case 'build':
    import('./commands/build.js').then((m) => m.build(sub));
    break;

  case 'deploy':
    import('./commands/deploy.js').then((m) => m.deploy(sub));
    break;

  case 'doctor':
    import('./commands/doctor.js').then((m) => m.doctor());
    break;

  case 'generate':
    import('./commands/generate.js').then((m) => m.generate(sub, extra));
    break;

  case 'dev':
    import('./commands/dev.js').then((m) => m.dev(sub));
    break;

  case 'logs':
    import('./commands/logs.js').then((m) => m.logs(sub));
    break;

  case 'env':
    import('./commands/env.js').then((m) => m.envCheck());
    break;

  case 'publish':
    import('./commands/publish.js').then((m) => m.publish(sub));
    break;

  case 'status':
    import('./commands/status.js').then((m) => m.status());
    break;

  case 'lint-prompt':
    import('./commands/lintPrompt.js').then((m) => m.lintPrompt(sub));
    break;

  case 'expand':
    import('./commands/expand.js').then((m) => m.expand(sub));
    break;

  case 'inspect':
    import('./commands/inspect.js').then((m) => m.inspect());
    break;

  case 'style':
    import('./commands/style.js').then((m) => m.style());
    break;

  case 'types':
    import('./commands/types.js').then((m) => m.types());
    break;

  case 'audit':
    import('./commands/audit.js').then((m) => m.audit());
    break;

  case 'testgen':
    import('./commands/testgen.js').then((m) => m.testgen(sub));
    break;

  case 'test-ai':
    import('./commands/test-ai.js').then((m) => m.testAi());
    break;

  case 'blueprint':
    import('./commands/blueprint.js').then((m) => m.blueprint());
    break;

  case 'release':
    import('./commands/release.js').then((m) => m.release());
    break;

  case 'docs':
    import('./commands/docs.js').then((m) => m.docs());
    break;

  case 'flows':
    import('./commands/flows.js').then((m) => m.flows());
    break;

  case 'simulate':
    import('./commands/simulate.js').then((m) => m.simulate());
    break;

  case 'help':
  case undefined:
    showHelp();
    break;

  default:
    console.log(chalk.red(`❌ Unknown command: ${command}`));
    showHelp();
    process.exit(1);
}
