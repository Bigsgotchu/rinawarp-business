const vscode = acquireVsCodeApi();

document.getElementById("send").onclick = () => {
  vscode.postMessage({
    type: "chat",
    message: document.getElementById("input").value,
    provider: document.getElementById("provider").value,
  });
};

document.getElementById("voice").onclick = async () => {
  document.getElementById("voiceStatus").innerText = "Listening…";
  vscode.postMessage({ type: "voiceRequest" });
};

document.getElementById("loadTree").onclick = () => {
  vscode.postMessage({ type: "loadTree" });
};

document.getElementById("deploy").onclick = () => {
  vscode.postMessage({ type: "deploy" });
};

document.getElementById("runShell").onclick = () => {
  vscode.postMessage({
    type: "shell",
    command: document.getElementById("shellInput").value,
  });
};

document.getElementById("refreshPlugins").onclick = () => {
  vscode.postMessage({ type: "listPlugins" });
};

document.getElementById("installPlugin").onclick = () => {
  vscode.postMessage({
    type: "installPlugin",
    url: document.getElementById("pluginUrl").value,
  });
};

window.addEventListener("message", (event) => {
  const msg = event.data;

  if (msg.type === "chatResponse") {
    document.getElementById("response").innerText = msg.data.reply;
  }

  if (msg.type === "treeData") {
    document.getElementById("tree").innerText = JSON.stringify(
      msg.data,
      null,
      2,
    );
  }

  if (msg.type === "voiceStatus") {
    document.getElementById("voiceStatus").innerText = msg.data;
  }

  if (msg.type === "shellOut") {
    document.getElementById("shellOut").innerText = msg.data;
  }

  if (msg.type === "pluginList") {
    document.getElementById("pluginList").innerText = JSON.stringify(
      msg.data,
      null,
      2,
    );
  }
});
