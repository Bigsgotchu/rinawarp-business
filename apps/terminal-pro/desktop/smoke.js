const electron = require("electron");
console.log("process.type:", process.type);               // should be "browser"
console.log("electron:", process.versions.electron);      // should be defined
console.log("node:", process.versions.node);              // should NOT be v22.x here
console.log("has app:", !!electron.app);                  // should be true
if (electron.app) electron.app.quit();
