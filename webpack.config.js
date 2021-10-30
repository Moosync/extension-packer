/* eslint-disable @typescript-eslint/no-var-requires */
var path = require("path");
const ShebangPlugin = require("webpack-shebang-plugin");


module.exports = {
    entry: "./src/main.ts",
    target: "node",
    mode: "production",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
        libraryTarget: "commonjs2",
        libraryExport: "default",
    },
    plugins: [new ShebangPlugin()],
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                use: "ts-loader",
                test: /\.ts?$/
            }
        ]
    },
};