import { autoUpdater } from 'electron-updater';
import { updaterLog } from '../utils/log';

autoUpdater.logger = updaterLog;

class JuggernautUpdater {
  constructor() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export default JuggernautUpdater;
