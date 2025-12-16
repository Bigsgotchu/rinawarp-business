console.log('Global electron available:', typeof electron !== 'undefined');
console.log('Global app available:', typeof app !== 'undefined');

if (typeof app !== 'undefined') {
  console.log('App found, version:', app.getVersion());
  app.whenReady().then(() => {
    console.log('App ready!');
    app.quit();
  });
} else {
  console.log('App is undefined - not running under Electron');
}
