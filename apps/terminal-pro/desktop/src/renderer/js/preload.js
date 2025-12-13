const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rinaAgent", {
  status: () => ipcRenderer.invoke("rina-agent:status"),
  tool: (tool, args, convoId) => ipcRenderer.invoke("rina-agent:tool", { tool, args, convoId }),
  chat: (text, convoId) => ipcRenderer.invoke("rina-agent:chat", { text, convoId }),
  onEvent: (cb) => {
    const handler = (_evt, msg) => cb(msg);
    ipcRenderer.on("rina-agent:event", handler);
    return () => ipcRenderer.removeListener("rina-agent:event", handler);
  }
});
