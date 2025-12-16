/**
 * Plan shape:
 * { id, description, command, cwd, requires: [ids], provides: [keys], idempotenceKey, capability, revertCommand? }
 * capabilities: 'docker'|'git'|'npm'|'network'|null
 */

// Add C# tool hookup at the top with other imports:
const { planCSharpScript, detectCSharpIntent, extractCSharp } = require('./tools/csharp');

function deterministicPlan(intent, cwd) {
  // 1) C# fast-path (if capability enabled)
  if (detectCSharpIntent(intent)) {
    const code = extractCSharp(intent);
    if (code) {
      return planCSharpScript({ code, args: [] }).steps.map((step) => ({
        ...step,
        cwd,
        command:
          step.action.type === 'exec'
            ? `${step.action.program} ${step.action.args.join(' ')}`
            : step.action.op,
        requires: step.dependsOn || [],
        provides: [step.idempotenceKey],
        revertCommand: null,
      }));
    }
  }

  // ... existing planners for python, docker, node, etc.
  const s = intent.toLowerCase();
  let steps = [];

  if (s.includes('init') && s.includes('python')) {
    steps = [
      S(
        'venv',
        'Create venv',
        'python3 -m venv .venv',
        cwd,
        [],
        ['venv:.venv'],
        'npm',
        'rm -rf .venv',
      ),
      S(
        'act',
        'Activate venv',
        "bash -lc 'source .venv/bin/activate'",
        cwd,
        ['venv'],
        [],
        null,
        null,
      ),
      S(
        'pip',
        'Install pytest',
        '.venv/bin/pip install pytest',
        cwd,
        ['venv'],
        ['pkg:pytest'],
        'network',
        '.venv/bin/pip uninstall -y pytest',
      ),
      S(
        'scaf',
        'Scaffold src',
        "bash -lc 'mkdir -p src && touch src/__init__.py'",
        cwd,
        [],
        ['fs:src'],
        null,
        "bash -lc 'rm -rf src'",
      ),
    ];
  } else if (s.includes('deploy')) {
    steps = [
      S('dock', 'Check Docker', 'docker --version', cwd, [], ['tool:docker'], 'docker', null),
      S(
        'build',
        'Build image',
        'docker build -t app:latest .',
        cwd,
        ['dock'],
        ['img:app:latest'],
        'docker',
        'docker image rm -f app:latest',
      ),
      S(
        'run',
        'Run container',
        'docker run --rm -p 8080:8080 app:latest',
        cwd,
        ['build'],
        ['ctr:app'],
        'docker',
        'docker ps -q --filter ancestor=app:latest | xargs -r docker stop',
      ),
    ];
  } else if (
    (s.includes('node') && (s.includes('setup') || s.includes('init'))) ||
    s.includes('npm init')
  ) {
    steps = [
      S(
        'npm',
        'npm init',
        'npm init -y',
        cwd,
        [],
        ['npm:pkg'],
        'npm',
        'git checkout -- package.json || true',
      ),
      S(
        'jest',
        'Install jest',
        'npm i -D jest',
        cwd,
        ['npm'],
        ['pkg:jest'],
        'network',
        'npm rm -D jest',
      ),
      S(
        'src',
        'Create src',
        "bash -lc 'mkdir -p src && echo module.exports={} > src/index.js'",
        cwd,
        [],
        ['fs:src'],
        null,
        "bash -lc 'rm -rf src'",
      ),
    ];
  } else {
    steps = [
      S(
        'echo',
        'Echo intent',
        `echo ${JSON.stringify(intent)}`,
        cwd,
        [],
        ['echo:intent'],
        null,
        null,
      ),
    ];
  }

  return steps.map((step) => ({
    ...step,
    idempotenceKey: step.idempotenceKey || step.provides[0] || step.id,
  }));
}

function S(
  id,
  description,
  command,
  cwd,
  requires = [],
  provides = [],
  capability = null,
  revertCommand = null,
  idempotenceKey = null,
) {
  return {
    id,
    description,
    command,
    cwd,
    requires,
    provides,
    capability,
    revertCommand,
    idempotenceKey,
  };
}

module.exports = { deterministicPlan };
