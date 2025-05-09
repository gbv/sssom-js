import { parseSSSOM, inputFormats } from "./lib/parsesssom.js"
import { TSVReader } from "./lib/tsvreader.js"
import { toJskosRegistry, toJskosMapping } from "./lib/jskos.js"

import { Readable } from "stream"

const parseSSSOMString = async (str, options = {}) => {
  // Avoid use of Readable.from as this is not available in browser
  const input = new Readable({
    objectMode: true,
    read() {
      this.push(str)
      this.push(null)
    },
  })
  return parseSSSOM(input, options)
}

//import { createRequire } from "module"
//const { version } = createRequire(import.meta.url)("./package.json")

export { parseSSSOM, parseSSSOMString, TSVReader, inputFormats, toJskosRegistry, toJskosMapping }
