import { spawn } from 'child_process';
import { mainLog } from '../../../utils/log';

export const port = process.env.PORT || 1212;
export const publicPath = `http://localhost:${port}/dist/`;

const devServer = {
  port,
  hot: true,
  publicPath,
  headers: { 'Access-Control-Allow-Origin': '*' },

  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/,
    poll: 100
  },

  historyApiFallback: true,

  // Start the main process as soon as the server is listening.
  after: () => {
    if (process.env.HOT) {
      spawn('npm', ['run', 'start-main-dev'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
      })
        .on('close', code => process.exit(code))
        .on('error', spawnError => mainLog.error(spawnError));
    }
  }
};

export default devServer;
