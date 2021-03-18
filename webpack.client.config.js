const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

const shouldMinimize = false;

module.exports = {
  mode: 'production',
  entry: {
    GameBoard: './src/client/entrypoints/game_board/game_board.ts',
    BoardTools: './src/client/entrypoints/board_tools/board_tools.ts',
    Sandbox: './src/client/entrypoints/sandbox/sandbox.tsx',
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
              configFile: 'tsconfig.client.json',
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
      _client: path.resolve(__dirname, 'src/client/'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['GameBoard'],
      filename: 'game_board.html',
      template: 'src/client/entrypoints/game_board/game_board.html',
      minify: shouldMinimize,
    }),
    new HtmlWebpackPlugin({
      chunks: ['BoardTools'],
      filename: 'board_tools.html',
      template: 'src/client/entrypoints/board_tools/board_tools.html',
      minify: shouldMinimize,
    }),
    new HtmlWebpackPlugin({
      chunks: ['Sandbox'],
      filename: 'sandbox.html',
      template: 'src/client/entrypoints/sandbox/sandbox.html',
      minify: shouldMinimize,
    }),
    new CompressionPlugin(),
  ],
  optimization: {
    minimize: shouldMinimize,
    splitChunks: {
      chunks: 'all',
    },
  },
  performance: {
    maxEntrypointSize: 600000,
  },
  output: {
    filename: '[name].[contenthash].client-bundle.js',
    path: path.resolve(__dirname, 'genfiles_static'),
  },
};
