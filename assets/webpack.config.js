const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => ({
  optimization: {
    // minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ]
  },
  entry: ['./js/app.js', 'bootstrap/dist/css/bootstrap.css', './css/app.scss'],
  output: {
    filename: 'js/app.js',
    path: path.resolve(__dirname, '../priv/static')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {url: false}
          },
          "sass-loader"
        ]
      },
      {
          test: /\.css$/,
          use:  [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "file-loader",
        options: {outputPath: "css", publicPath: "/css"}
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/app.css' }),
    new CopyWebpackPlugin({patterns: [{ from: 'static/', to: '.' }]}),
    new webpack.ProvidePlugin({
      jQuery: "jquery",
    })
  ]
});
