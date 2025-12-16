function explainStep(step) {
  const c = step.command;
  if (/python3 -m venv/.test(c)) return 'Creates an isolated Python environment in .venv.';
  if (/source .venv\/bin\/activate/.test(c))
    return 'Activates the virtual environment so python/pip refer to .venv.';
  if (/\bpip install pytest\b/.test(c)) return 'Installs pytest for running tests.';
  if (/docker build/.test(c))
    return 'Builds a Docker image named app:latest from the current directory.';
  if (/docker run/.test(c)) return 'Runs the image, mapping container port 8080 to host 8080.';
  if (/npm init/.test(c)) return 'Initializes a Node.js project with a package.json.';
  if (/\bnpm i -D jest\b/.test(c)) return 'Adds Jest as a devDependency for testing.';
  return `Runs: ${c}`;
}

module.exports = { explainStep };
