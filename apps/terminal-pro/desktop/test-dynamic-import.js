(async () => {
  try {
    console.log('Testing dynamic import...');
    const { app, BrowserWindow } = await import('electron');
    console.log('Import successful!');
    console.log('App type:', typeof app);
    console.log('BrowserWindow type:', typeof BrowserWindow);

    if (app && typeof app.whenReady === 'function') {
      console.log('Calling app.whenReady...');
      await app.whenReady();
      console.log('App.whenReady() successful!');

      const win = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
      });

      console.log('Window created successfully!');

      setTimeout(() => {
        app.quit();
      }, 1000);
    } else {
      console.log('App.whenReady not available');
      setTimeout(() => process.exit(0), 1000);
    }
  } catch (error) {
    console.error('Error:', error.message);
    setTimeout(() => process.exit(1), 1000);
  }
})();
