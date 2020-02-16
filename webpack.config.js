const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProductionBuild = argv.mode === 'production';
  const publicPath = '/';

  const css = {
    test: /\.css$/,
    use: [
      isProductionBuild ? MiniCssExtractPlugin.loader : 'style-loader',
      'css-loader'
    ]
  };

  const files = {
    test: /\.(png|jpe?g|gif|woff2?)$/i,
    loader: 'file-loader',
    options: {
      name: '[hash].[ext]'
    }
  };

  const config = {
    entry: {
      overlay: ['./src/overlay/style.css', './src/overlay/script.js'],
      slider: ['./src/slider/style.css', './src/slider/script.js']
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].[hash].build.js',
      publicPath: isProductionBuild ? publicPath : '',
      chunkFilename: '[chunkhash].js'
    },
    module: {
      rules: [css, files]
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      },
      extensions: ['*', '.js', '.vue', '.json']
    },
    devServer: {
      historyApiFallback: true,
      noInfo: false,
      overlay: true
    },
    performance: {
      hints: false
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/overlay/index.html',
        filename: 'overlay/index.html',
        chunks: ['overlay']
      }),
      new HtmlWebpackPlugin({
        template: 'src/slider/index.html',
        filename: 'slider/index.html',
        chunks: ['slider']
      })
    ],
    devtool: '#eval-source-map'
  };

  if (isProductionBuild) {
    config.devtool = 'none';
    config.plugins = (config.plugins || []).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[contenthash].css'
      })
    ]);

    config.optimization = {};

    config.optimization.minimizer = [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({})
    ];
  }

  return config;
};
