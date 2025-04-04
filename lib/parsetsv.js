import { TSVReader } from "./tsvreader.js"
import { parse } from "yaml"
import { validateMetadata } from "./metadata.js"
import fs from "fs"

function inputFrom(input) {
  if (input === "-") {
    return process.stdin
  } else if (typeof input === "string") {
    return fs.createReadStream(input)
  } else if (typeof input?.on === "function") {
    return input
  } else {
    throw new Error("Input must be filename, '-', or readable stream!")
  }
}

export const parseTSV = async (input, { metadata, metadataHandler, mappingHandler } = {}) => {
  return await new Promise((resolve, reject) => {
    (async () => {
      const inputStream = inputFrom(input)

      if (metadata) {
        if (metadata?.constructor === Object) {
          metadata = validateMetadata(metadata)
        } else {
          metadata = parse(await new Response(inputFrom(metadata)).text())
        }
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
