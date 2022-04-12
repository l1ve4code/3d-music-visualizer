const path = require("path");

module.exports = ({development}) => ({
    entry: "./src/index.ts",
    devtool: development ? "inline-source-map" : false,
    mode: development ? "development" : "production",
    module: {
        rules: [
            {
                test: /\.ts/,
                use: ["babel-loader", "ts-loader"],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        library: {
            name: "MusicVisualizer",
            type: "umd",
            umdNamedDefine: true,
        },
        path: path.resolve(__dirname, "dist"), 
        filename: "index.js",
    }
});