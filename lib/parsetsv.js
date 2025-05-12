import { TSVReader } from "./tsvreader.js"
import { inputFrom, readMetadata } from "./input.js"
import { sssomOrJskos } from "./jskos.js"

export const parseTSV = async (input, options = {}) => {
  let { metadata, curie, propagate, metadataHandler, mappingHandler } = options

  return new Promise((resolve, reject) => {
    (async () => {
      const inputStream = inputFrom(input)

      if (metadata) {
        metadata = await readMetadata(metadata).catch(e => reject(e))
      }

      const readerOpts = { metadata, collectMappings: !mappingHandler, curie, propagate }
      const reader = new TSVReader(inputStream, readerOpts)

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

      reader.on("end", sssom => resolve(sssomOrJskos(sssom, options.to)))
    })()
  })
}
