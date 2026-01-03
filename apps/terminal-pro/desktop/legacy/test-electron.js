const electron = require('electron');
console.log('Electron:', electron);
console.log('Type:', typeof electron);
console.log('Constructor:', electron?.constructor?.name);

// Test if it's the right type
if (typeof electron === 'string') {
  console.log('Electron is a path:', electron);
} else {
  console.log('Electron has app:', !!electron?.app);
  console.log('Electron has BrowserWindow:', !!electron?.BrowserWindow);
}