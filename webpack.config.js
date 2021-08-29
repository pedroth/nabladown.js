const path = require("path");
const nodeExternals = require("webpack-node-externals");

const baseConfig = {
  mode: "production",
  entry: {
    Parser: "./src/Parser.js",
    Render: "./src/Render.js",
    CodeRender: "./src/CodeRender.js",
    MathRender: "./src/MathRender.js",
    NabladownRender: "./src/NabladownRender.js"
  },
  devtool: "source-map",
  output: {
    path: path.resolve("./dist/"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              [
                "@babel/plugin-transform-runtime",
                { useESModules: true, helpers: true }
              ]
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: "url-loader"
        }
      }
    ]
  }
};

const serverConfig = { ...baseConfig };
serverConfig.target = "node";
serverConfig.output = { ...baseConfig.filename };
serverConfig.output.filename = "[name].node.js";
serverConfig.externals = [nodeExternals()];

const clientConfig = { ...baseConfig };
clientConfig.target = "web";

module.exports = [serverConfig, clientConfig];
