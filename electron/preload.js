/**
 * When running `npm run build` or `npm run build-preload`, this file is compiled to
 * `/dist/preload.js` using webpack.
 */
import { ipcRenderer, remote } from 'electron';
import os from 'os';
import lndGrpcProtoDir from '../utils/lndGrpcProtoDir';
import getPackageDetails from '../utils/getPackageDetails';

/**
 * List of environment variables that we want to make available.
 *
 * @type {Array}
 */
const WHITELISTED_ENV_VARS = [
  'DEBUG',
  'DEBUG_LEVEL',
  'DEBUG_PROD',
  'NODE_ENV',
  'HOT'
];

function getUserDataDir() {
  return remote.app.getPath('userData');
}

// Provide access to whitelisted environment variables.
window.env = Object.keys(process.env)
  .filter(key => WHITELISTED_ENV_VARS.includes(key))
  .reduce((obj, key) => {
    obj[key] = process.env[key];
    return obj;
  }, {});

// Expose a bridging API to by setting an global on `window`.
//
// !CAREFUL! do not expose any functionality or APIs that could compromise the
// user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
window.Juggernaut = {
  getUserDataDir,
  getPackageDetails,
  lndProtoDir: lndGrpcProtoDir(),
  getPlatform: () => os.platform()
};

// Provide access to ipcRenderer.
window.ipcRenderer = ipcRenderer;

// Provide access to electron remote
window.showOpenDialog = remote.dialog.showOpenDialog;
