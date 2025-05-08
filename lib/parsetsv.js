import { TSVReader } from "./tsvreader.js"
import { inputFrom, readMetadata } from "./input.js"

export const parseTSV = async (input, options = {}) => {
  let { metadata, curie, metadataHandler, mappingHandler } = options

  return new Promise((resolve, reject) => {
    (async () => {
      const inputStream = inputFrom(input)

      if (metadata) {
        metadata = await readMetadata(metadata).catch(e => reject(e))
      }

      options = { metadata, collectMappings: !mappingHandler, curie }
      const reader = new TSVReader(inputStream, options)

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
