const { notarize } = require('@electron/notarize');

exports.default = async function notarizeMac(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  try {
    await notarize({
      appBundleId: 'com.rinawarp.terminalpro',
      appPath,
      appleId: process.env.MAC_APPLE_ID,
      appleIdPassword: process.env.MAC_APPLE_ID_PASSWORD,
      teamId: process.env.MAC_TEAM_ID,
    });
    console.log('Notarization successful');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};
