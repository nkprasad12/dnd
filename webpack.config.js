const path = require('path');

module.exports = {
  entry: {
    GameBoard: './src/game_board/game_board.ts',
    BoardTools: './src/board_tools/board_tools.ts',
    Sandbox: './src/upload.ts',
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
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app/static/dist'),
  },
};
