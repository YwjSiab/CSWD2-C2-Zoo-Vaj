/* eslint-env node */
import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const prod = argv.mode === "production";

  return {
    entry: "./src/index.js", // your app entry
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: prod ? "assets/js/[name].[contenthash].js" : "assets/js/bundle.js",
      clean: true,
    },
    devtool: prod ? "source-map" : "eval-cheap-module-source-map",
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "defaults" }]],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|mp3)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      // Build index.html from /public/index.html
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "index.html"),
        inject: "body",
        minify: prod && "auto",
      }),

      // Copy everything else in /public except index.html to avoid conflicts
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: ".",
            globOptions: { ignore: ["**/index.html"] },
          },
        ],
      }),

      new MiniCssExtractPlugin({
        filename: prod ? "assets/css/[name].[contenthash].css" : "assets/css/styles.css",
      }),

      new ESLintPlugin({ extensions: ["js"] }),
    ],

    devServer: {
      static: [
        path.resolve(__dirname, "dist"),
        path.resolve(__dirname, "public"),
      ],
      proxy: [
        {
          context: ["/ping", "/api"],
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      ],
      port: 5173,
      open: true,
    },
  };
};
