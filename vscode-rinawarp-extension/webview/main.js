const vscode = acquireVsCodeApi();

function sendMessage(command) {
  vscode.postMessage({ command });
}

// Expose to global scope for button onclick handlers
window.sendMessage = sendMessage;