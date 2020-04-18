// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db
/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const electronNotarize = require('electron-notarize');

module.exports = async function afterSignHook(params) {
  if (params.electronPlatformName !== 'darwin') {
    return;
  }
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }
  console.log('afterSign hook triggered', params);

  // Same appId in electron-builder.
  const appBundleId = 'com.getjuggernaut';

  const appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  );
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appBundleId} found at ${appPath}`);

  try {
    await electronNotarize.notarize({
      appBundleId,
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider: process.env.APPLE_ID_TEAMID
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appBundleId}`);
};
