import { TSVReader } from "../lib/tsvreader.js"
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
    const inputStream = inputFrom(input)

    // TODO: support external metadata mode when `metadata` is set

    const reader = new TSVReader(inputStream)

    reader.on("metadata", data => {
      metadata = data
      if (!mappingHandler) {
        metadata.mappings = []
      }
      if (metadataHandler) {
        metadataHandler(metadata)
      }
    })

    reader.on("mapping", mapping => {
      console.log("GOT MAPPING")
      if (mappingHandler) {
        mappingHandler(mapping)
      } else {
        metadata.mappings.push(mapping)
      }
    })

    reader.on("error", err => {
      if (err.code === "EPIPE") {
        resolve()
      } else {
        reject(err)
      }
    })

    reader.on("end", () => resolve(metadata))
  })
}
