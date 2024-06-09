import path from 'node:path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import AddAssetPlugin from 'add-asset-webpack-plugin';
import { globSync } from 'glob';

const { dirname } = import.meta;

/** @type { webpack.Configuration } */
export default {
  devServer: {
    port: 9000,
    open: true,
    hot: false,
    client: {
      logging: 'warn',
    },
  },
  entry: {
    app: path.join(dirname, 'src/index.tsx'),
    'service-worker': path.join(dirname, 'src/service-worker.ts'),
  },
  output: {
    path: path.join(dirname, 'dist'),
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
      template: path.join(dirname, 'src/index.html'),
      excludeChunks: ['service-worker'],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'data', to: 'data' }],
    }),
    new AddAssetPlugin(
      'maps.json',
      JSON.stringify(
        globSync('**/*.elm.gz', { cwd: path.join(dirname, 'data/maps') })
      )
    ),
    new AddAssetPlugin(
      '3dobjects.json',
      JSON.stringify(
        globSync('**/*.e3d', { cwd: path.join(dirname, 'data/3dobjects') })
      )
    ),
    new AddAssetPlugin(
      '2dobjects.json',
      JSON.stringify(
        globSync('**/*.2d0', { cwd: path.join(dirname, 'data/2dobjects') })
      )
    ),
  ],
};
