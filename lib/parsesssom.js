import fs from "fs"
import { parseTSV } from "./parsetsv.js"
import { parseJSON } from "./parsejson.js"

export const inputFormats = ["csv","tsv","json"]

export const parseSSSOM = async (input, options = {}) => {  

  // get or guess input format
  let from = options.from
  if (!from) {
    if (typeof input === "string" && input.split(".").pop()) {
      from = input.split(".").pop()
    } else {
      from = "tsv"
    }
  }

  if (options.curie && typeof options.curie === "string") {
    // TODO: make sure its a JSON object of strings
    options.curie = JSON.parse(fs.readFileSync(options.curie))
  }

  if (from === "tsv") {
    return parseTSV(input, options)
  } else if (from === "csv") {
    return parseTSV(input, { ...options, delimiter: "," })
  } else if (from === "json") {
    return parseJSON(input, options)
  } else {
    throw new Error(`Unsupported input format ${options.from}`)
  }
}
