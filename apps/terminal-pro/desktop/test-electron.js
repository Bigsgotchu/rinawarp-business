const electron = require('electron');
console.log('Electron type:', typeof electron);
console.log('Electron keys:', Object.keys(electron));
console.log('App type:', typeof electron.app);
if (electron.app) {
  console.log('App methods:', Object.getOwnPropertyNames(electron.app).slice(0, 10));
}
