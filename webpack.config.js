const HtmlWebpackPlugin = require("html-webpack-plugin");
const { webpack } = require("webpack");
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "src"),
    },
    compress: true,
    port: 9000,
  },
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{ loader: "url-loader" }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Test",
      template: "index.html",
    }),
  ],
};
