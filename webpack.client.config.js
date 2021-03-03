const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    Info: './src/client/entrypoints/index/index.ts',
    GameBoard: './src/client/entrypoints/game_board/game_board.ts',
    BoardTools: './src/client/entrypoints/board_tools/board_tools.ts',
    Sandbox: './src/client/entrypoints/sandbox/sandbox.ts',
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
      chunks: ['Info'],
      filename: 'info.html',
      template: 'src/client/entrypoints/index/index.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      chunks: ['GameBoard'],
      filename: 'game_board.html',
      template: 'src/client/entrypoints/game_board/game_board.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      chunks: ['BoardTools'],
      filename: 'board_tools.html',
      template: 'src/client/entrypoints/board_tools/board_tools.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      chunks: ['Sandbox'],
      filename: 'sandbox.html',
      template: 'src/client/entrypoints/sandbox/sandbox.html',
      minify: false,
    }),
  ],
  optimization: {
    minimize: false,
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
