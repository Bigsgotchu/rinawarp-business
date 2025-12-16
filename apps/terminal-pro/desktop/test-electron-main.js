console.log('Global electron available:', typeof electron !== 'undefined');
console.log('Global app available:', typeof app !== 'undefined');
console.log('Global BrowserWindow available:', typeof BrowserWindow !== 'undefined');
if (typeof app !== 'undefined') {
  console.log('App ready status check...');
  app
    .whenReady()
    .then(() => {
      console.log('App.whenReady() works!');
      app.quit();
    })
    .catch((err) => {
      console.log('App.whenReady() error:', err);
      app.quit();
    });
} else {
  console.log('App is undefined - Electron APIs not available');
  setTimeout(() => process.exit(0), 1000);
}
