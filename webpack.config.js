import path from "path"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import webpack from "webpack"

export default {
  entry: "./index.js",
  output: {
    filename: "sssom.js",
    path: path.resolve("./docs"),
    library: "SSSOM",
    libraryTarget: "var",
  },
  mode: "production",
  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: ["fs", "stream", "Buffer", "Readable"],
    }),
    // FIX https://github.com/nodejs/readable-stream/issues/540
    new webpack.DefinePlugin({
      process: {
        nextTick: (cb, ...args) => setTimeout(() => cb(...args), 0),
      },
    }),
  ],
}
