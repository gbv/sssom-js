import { TSVReader } from "./tsvreader.js"
import { inputFrom, readMetadata } from "./input.js"
import { sssomOrJskos } from "./jskos.js"

export const parseTSV = async (input, options = {}) => {
  let { metadata, curie, propagate, metadataHandler, mappingHandler, delimiter, liberal } = options


  return new Promise((resolve, reject) => {
    (async () => {

      if (!input) { // empty input
        const sssom = metadata ?
          await readMetadata(metadata, { liberal, curie }).catch(e => reject(e)) : {}
        if (metadataHandler) {
          metadataHandler(sssom)
        }
        resolve(sssom)
        return
      }

      const inputStream = inputFrom(input)

      if (metadata) {
        metadata = await readMetadata(metadata, { liberal, curie }).catch(e => reject(e))
      }
        
      const readerOpts = { metadata, curie, propagate, delimiter }
      readerOpts.storeMappings = !mappingHandler
      readerOpts.liberal = options.liberal || !input
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

      reader.on("end", sssom => {
        if (options.mappings) {
          sssom = { mappings: sssom.mappings }
        }
        resolve(sssomOrJskos(sssom, options))
      })
    })()
  })
}
