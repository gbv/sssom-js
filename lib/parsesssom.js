import { parseTSV } from "./parsetsv.js"
import { parseJSON } from "./parsejson.js"

export const inputFormats = ["tsv","json"]

export const parseSSSOM = async (input, options = {}) => {
  const from = options.from ?? "tsv"

  if (from === "tsv") {
    return parseTSV(input, options)
  } else if (from === "json") {
    return parseJSON(input, options)
  } else {
    throw new Error(`Unsupported input format ${options.from}`)
  }
}
