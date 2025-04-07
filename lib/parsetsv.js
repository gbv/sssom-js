import { TSVReader } from "./tsvreader.js"
import { parse } from "yaml"
import { validateMetadata } from "./validate.js"
import { inputFrom } from "./input.js"

export const parseTSV = async (input, { metadata, metadataHandler, mappingHandler } = {}) => {
  return await new Promise((resolve, reject) => {
    (async () => {
      const inputStream = inputFrom(input)

      if (metadata) {
        if (metadata?.constructor !== Object) {
          metadata = parse(await new Response(inputFrom(metadata)).text())
        }
        metadata = validateMetadata(metadata)
      }

      const reader = new TSVReader(inputStream, { metadata, collectMappings: !mappingHandler })

      if (metadataHandler) {
        reader.on("metadata", metadataHandler)
      }

      if (mappingHandler) {
        reader.on("mapping", mappingHandler)
      }

      reader.on("error", err => {
        if (err.code === "EPIPE") {
          resolve()
        } else {
          reject(err)
        }
      })

      reader.on("end", resolve)
    })()
  })
}
