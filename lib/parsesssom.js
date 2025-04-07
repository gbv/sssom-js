import consumers from "stream/consumers"
import { parseTSV } from "./parsetsv.js"
import { inputFrom } from "./input.js"

export const inputFormats = ["tsv","json"]

export const parseSSSOM = async (input, options = {}) => {
  const { metadataHandler, mappingHandler } = options
  const from = options.from ?? "tsv"

  if (from === "tsv") {
    return parseTSV(input, options)
  } else if (from === "json") {
    // TODO: support external metadata

    const mappingSet = await consumers.json(inputFrom(input))
    // TODO: validate

    if (metadataHandler) {
      const { mappings: _, ...metadata } = mappingSet // eslint-disable-line
      metadataHandler(metadata)
    }
    if (mappingHandler && mappingSet.mappings) {
      mappingSet.mappings.forEach(mappingHandler)
    }
    return mappingSet
  } else {
    throw new Error(`Unsupported input format ${options.from}`)
  }
}

