const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');


module.exports = {
  entry: {
    GameBoard: './src/game_board/game_board.ts',
    BoardTools: './src/board_tools/board_tools.ts',
    Sandbox: './src/sandbox.ts',
  },
  // devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['GameBoard'],
      filename: 'game_board.html',
      template: 'app/templates/templates/game_board.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      chunks: ['BoardTools'],
      filename: 'board_tools.html',
      template: 'app/templates/templates/board_tools.html',
      minify: false,
    }),
    new HtmlWebpackPlugin({
      chunks: ['Sandbox'],
      filename: 'sandbox.html',
      template: 'app/templates/templates/sandbox.html',
      minify: false,
    }),
  ],
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'app/static/dist'),
  },
};
