// webpack.config.js
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map', 
  entry: './src/renderer/gui/index.js',
  output: {
    path: path.resolve(__dirname, 'src/renderer/gui'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
    alias: {
      'prop-types': path.resolve(__dirname, 'node_modules/prop-types'),
    },
  },
  target: 'electron-renderer',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: path.resolve(__dirname, 'src/renderer/gui'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};