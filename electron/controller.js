import { app, ipcMain } from 'electron';
import { mainLog } from '../utils/log';
import sanitize from '../utils/sanitize';

class JuggernautController {
  constructor(mainWindow) {
    // Variable to hold the main window instance.
    this.mainWindow = mainWindow;

    // Active process pids, keyed by process name.
    this.processes = {};

    ipcMain.on('processSpawn', (event, { name, pid }) => {
      this.processes[name] = pid;
    });
    ipcMain.on('processExit', (event, { name }) => {
      this.processes[name] = null;
    });
  }

  /**
   * init - Initialize the controller.
   *
   * @param  {[object]} options Options to pass through to the renderer
   */
  init(options) {
    // Load the application into the main window.
    mainLog.debug(process.env.HOT);
    if (process.env.HOT) {
      const port = process.env.PORT || 1212;
      mainLog.debug('in here');
      this.mainWindow.loadURL(`http://localhost:${port}/dist/index.html`);
    } else {
      this.mainWindow.loadURL(`file://${__dirname}/index.html`);
    }

    // Once the winow content has fully loaded, bootstrap the app.
    this.mainWindow.webContents.on('did-finish-load', () => {
      mainLog.trace('webContents.did-finish-load');

      // Show the window as soon as the application has finished loading.
      this.mainWindow.show();
      this.mainWindow.focus();

      // Start app.
      this.initApp(options);
    });
  }

  initApp(options) {
    mainLog.debug('initApp...');
    // In the case the app is reloaded usung ctrl+r the app will aborted instantly without being given a chance to
    // shutdown any processes spawned by it. Before starting the app again, kill any processes known to have been
    // started by us.
    this.killAllSpawnedProcesses();
    // Send a signal to the renderer process telling it to start it's initialisation.
    this.sendMessage('initApp', options);
  }

  /**
   * terminate - Terminate the app.
   */
  terminate() {
    mainLog.debug('terminate...');
    // Send a message to the renderer process telling it to to gracefully shutdown. We register a success callback with
    // it so that we can complete the termination and quit electon once the app has been fully shutdown.
    ipcMain.on('terminateAppSuccess', () => app.quit());

    ipcMain.on('terminateAppFailed', (event, e) => {
      mainLog.info('terminateAppFailed: %o', e);
      this.killAllSpawnedProcesses();
      app.quit();
    });

    this.sendMessage('terminateApp');
  }

  /**
   * sendMessage - Send a message to the main window.
   *
   * @param  {string} msg message to send.
   * @param  {object} data additional data to accompany the message.
   */
  sendMessage(msg, data) {
    if (this.mainWindow) {
      mainLog.info('Sending message to renderer process: %o', {
        msg,
        data: sanitize(data, ['lndconnectUri', 'lndconnectQRCode'])
      });
      this.mainWindow.webContents.send(msg, data);
    } else {
      mainLog.warn(
        'Unable to send message to renderer process (main window not available): %o',
        {
          msg,
          data
        }
      );
    }
  }

  /**
   * killAllSpawnedProcesses - Terminate any processes known to have been started by the app.
   */
  killAllSpawnedProcesses() {
    Object.keys(this.processes).forEach(key => {
      const pid = this.processes[key];
      if (pid) {
        mainLog.debug(`Killing ${key} process with pid ${pid}`);
        try {
          process.kill(pid);
        } catch (e) {
          mainLog.warn(`Unable to kill ${key} process with pid ${pid}`);
        } finally {
          this.processes[key] = null;
        }
      }
    });
  }
}

export default JuggernautController;
