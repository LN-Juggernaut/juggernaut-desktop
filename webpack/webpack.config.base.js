/**
 * Base webpack config used across other specific configs
 */

import fs from 'fs';
import path from 'path';
import { IgnorePlugin } from 'webpack';
import config from 'config';

export const rootDir = path.join(__dirname, '..');

// This will take the config based on the current NODE_ENV and save it to 'dist/config.json'
// The webpack alias below will then build that file into the client build.
const distDir = path.resolve(rootDir, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  path.resolve(rootDir, 'dist/config.json'),
  JSON.stringify(config)
);

export default {
  context: rootDir,

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    modules: [path.resolve(rootDir, 'renderer'), 'node_modules'],
    // Define an alias that makes the global config available.
    alias: {
      config: path.resolve(rootDir, 'dist/config.json')
    }
  },

  plugins: [new IgnorePlugin(/^\.\/locale$/, /moment$/)],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward',
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          }
        ]
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'file-loader'
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'file-loader'
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader'
      }
    ]
  },
  optimization: {
    namedModules: true
  }
};
