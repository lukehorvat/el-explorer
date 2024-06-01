const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/** @type { webpack.Configuration } */
module.exports = {
  devServer: {
    port: 9000,
    open: true,
    hot: false,
    client: {
      logging: 'warn',
    },
  },
  entry: {
    app: path.join(__dirname, 'src/index.tsx'),
    'service-worker': path.join(__dirname, 'src/service-worker.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: ({ runtime }) => {
      if (runtime === 'service-worker') {
        // Ensure that the service worker filename is stable (i.e. doesn't have a hash in it).
        return '[name].js';
      }

      return '[name]-[contenthash].js';
    },
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '...'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          onlyCompileBundledFiles: true,
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash][ext][query]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name]-[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      excludeChunks: ['service-worker'],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/data', to: 'data' }],
    }),
  ],
};
