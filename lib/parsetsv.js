import { TSVReader } from "./tsvreader.js"
import { inputFrom, readMetadata } from "./input.js"

export const parseTSV = async (input, { metadata, metadataHandler, mappingHandler } = {}) => {
  return await new Promise((resolve, reject) => {
    (async () => {
      const inputStream = inputFrom(input)

      if (metadata) {
        metadata = await readMetadata(metadata)
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
