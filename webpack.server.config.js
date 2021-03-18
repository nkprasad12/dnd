const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  target: 'node',
  entry: {
    prestart: ['./src/server/prestart.ts'],
    server: ['./src/server/main.ts'],
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 500,
    poll: 1500,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.server.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      _common: path.resolve(__dirname, 'src/common/'),
      _server: path.resolve(__dirname, 'src/server/'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  externals: {
    '@google-cloud/storage': 'commonjs @google-cloud/storage',
    'express': 'commonjs express',
    'body-parser': 'commonjs body-parser',
    'express-session': 'commonjs express-session',
    'multer': 'commonjs multer',
    'socket.io': 'commonjs socket.io',
    'passport': 'commonjs passport',
    'passport-local': 'commonjs passport-local',
  },
  optimization: {
    minimize: false,
  },
  mode: 'development',
};
