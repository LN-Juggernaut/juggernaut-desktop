import path from 'path';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import baseConfig, { rootDir } from '../webpack.config.base';
import plugins from './common/plugins';

const config = merge.smart(baseConfig, {
  name: 'renderer',
  target: 'web',
  mode: 'production',
  devtool: 'source-map',
  entry: {
    renderer: path.join(rootDir, 'renderer', 'index')
  },
  output: {
    filename: '[name].js',
    path: path.join(rootDir, 'dist')
  },
  stats: {
    children: false
  },
  plugins: [
    ...plugins,
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join('renderer', 'app.html')
    })
  ],
  node: {
    fs: 'empty',
    module: 'empty'
  },
  optimization: {
    noEmitOnErrors: true
  }
});

export default config;
