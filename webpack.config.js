import path from "path"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import webpack from "webpack"

//import { createRequire } from "node:module"
//const { version } = createRequire(import.meta.url)("./package.json")

const mode = "production"
//(const mode = "development"

const config = {
  entry: "./index.js",
  output: {
    filename: "sssom.js",
    path: path.resolve("./docs"),
    library: "SSSOM",
    libraryTarget: "var",
  },
  mode,
  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: ["fs", "stream", "Buffer", "Readable"],
    }),
    // FIX https://github.com/nodejs/readable-stream/issues/540
    new webpack.DefinePlugin({
      process: {
        nextTick: (cb, ...args) => setTimeout(() => cb(...args), 0),
      },
      //packageVersion: version
    }),
  ],
}

if (mode === "development") {
  config.devtool = "eval-source-map"
}

export default config

