const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const shouldMinimize = true;

module.exports = {
  mode: 'production',
  entry: {
    Main: './src/client/entrypoints/main/main.tsx',
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
      chunks: ['Main'],
      filename: 'game_board.html',
      template: 'src/client/entrypoints/main/main.html',
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
    minimizer: [
      new TerserPlugin({
        include: 'vendorBundle'
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 10000,
      cacheGroups: {
        vendorBundle: {
          test: /[\\/]node_modules[\\/]/,
          priority: 0,
          reuseExistingChunk: true,
          name(_module, _chunks, cacheGroupKey) {
            return `${cacheGroupKey}`;
          },
        },
        srcBundle: {
          minChunks: 2,
          priority: -5,
          reuseExistingChunk: true,
        },
      }
    },
  },
  performance: {
    maxEntrypointSize: 600000,
  },
  output: {
    filename: '[name].[contenthash].client-bundle.js',
    path: path.resolve(__dirname, 'genfiles_static'),
  },
  stats: {
    builtAt: true,
    entrypoints: true,
  },
};
