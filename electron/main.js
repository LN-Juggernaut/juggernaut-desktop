/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
import { app, BrowserWindow, screen } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import os from 'os';
import bip21 from 'bip21';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} from 'electron-devtools-installer';
import { mainLog } from '../utils/log';
import MenuBuilder from './menu';
import JuggernautController from './controller';
import JuggernautUpdater from './updater';

let mainWindow = null;
let juggernaut = null;
let protocolUrl = null;

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const handleBitcoinLink = link => {
  try {
    const decodedLink = bip21.decode(link);
    juggernaut.sendMessage('bitcoinLinkClicked', decodedLink);
    mainWindow.show();
  } catch (e) {}
};

const handleLightningLink = link => {
  try {
    const paymentRequest = link.split(':')[1];
    juggernaut.sendMessage('lightningLinkClicked', { paymentRequest });
    mainWindow.show();
  } catch (e) {}
};

const protocolHandlers = {
  bitcoin: handleBitcoinLink,
  lightning: handleLightningLink
};

const handleOpenUrl = url => {
  if (mainWindow) {
    const [protocol] = url.split(':');
    const handler = protocolHandlers[protocol];
    if (handler) {
      handler(url);
    }
  } else {
    protocolUrl = url;
  }
};

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};
const createWindow = async () => {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(display => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  const winOptions = {
    show: false,
    width: 1000,
    height: 550,
    backgroundColor: 'white',
    minWidth: 400,
    minHeight: 500,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      preload: isDev
        ? path.resolve(__dirname, '..', 'dist', 'preload.js')
        : path.resolve(__dirname, 'preload.js')
    }
  };

  if (isDev && externalDisplay) {
    winOptions.width = 3000;
    winOptions.x = externalDisplay.bounds.x + 250;
    winOptions.y = externalDisplay.bounds.y + 50;
  }

  mainWindow = new BrowserWindow(winOptions);

  juggernaut = new JuggernautController(mainWindow);
  juggernaut.init({});

  const updater = new JuggernautUpdater();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
    juggernaut.mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    const url = protocolUrl || process.argv.slice(1)[0];
    if (url) {
      handleOpenUrl(url);
      protocolUrl = null;
    }
  });

  app.on('before-quit', event => {
    mainLog.trace('app.before-quit');
    if (mainWindow && !mainWindow.forceClose) {
      event.preventDefault();
      mainWindow.forceClose = true;
      juggernaut.terminate();
    }
  });

  app.on('will-quit', () => {
    mainLog.trace('app.will-quit');
  });

  app.on('quit', () => {
    mainLog.trace('app.quit');
  });

  app.on('window-all-closed', () => {
    mainLog.trace('app.window-all-closed');
    if (os.platform() !== 'darwin' || mainWindow.forceClose) {
      app.quit();
    }
  });

  app.on('activate', () => {
    mainLog.trace('app.activate');
    if (mainWindow) {
      mainWindow.show();
    }
  });

  app.on('second-instance', (event, cli) => {
    const getUrl = () => {
      const protocols = Object.keys(protocolHandlers);
      const isKnownProtocol = value =>
        protocols.find(protocol => value.indexOf(`${protocol}:`) === 0);
      return cli.find((value, index) => index > 0 && isKnownProtocol(value));
    };
    if (os.platform !== 'darwin') {
      const url = cli && getUrl();
      if (url) {
        handleOpenUrl(url);
      }
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  mainWindow.on('close', event => {
    mainLog.trace('mainWindow.close');
    if (os.platform() === 'darwin') {
      if (!mainWindow.forceClose) {
        event.preventDefault();
        if (mainWindow.isFullScreen()) {
          mainWindow.once('leave-full-screen', () => {
            mainWindow.hide();
          });
          mainWindow.setFullScreen(false);
        } else {
          mainWindow.hide();
        }
      }
    } else if (!mainWindow.forceClose) {
      event.preventDefault();
      mainWindow.hide();
      app.quit();
    }
  });

  mainLog.info(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support'); // eslint-disable-line global-require
    sourceMapSupport.install();
  }

  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD) {
    if (process.env.REINSTALL_DEVTOOLS) {
      BrowserWindow.removeDevToolsExtension(REACT_DEVELOPER_TOOLS);
      BrowserWindow.removeDevToolsExtension(REDUX_DEVTOOLS);
    }

    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => mainLog.debug(`Added Extension: ${name}`))
      .catch(err =>
        mainLog.warn(
          `An error occurred when installing REACT_DEVELOPER_TOOLS: ${err}`
        )
      );

    installExtension(REDUX_DEVTOOLS)
      .then(name => mainLog.debug(`Added Extension: ${name}`))
      .catch(err =>
        mainLog.warn(`An error occurred when installing REDUX_DEVTOOLS: ${err}`)
      );
  }

  mainWindow.webContents.once('dom-ready', () => {
    mainLog.trace('webContents.dom-ready');
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD) {
      mainWindow.openDevTools();
    }
  });
};

app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleOpenUrl(url);
  });
});

app.on('ready', createWindow);

app.setAsDefaultProtocolClient('bitcoin');
app.setAsDefaultProtocolClient('lightning');
