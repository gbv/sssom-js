import fs from "fs"
import { parse } from "yaml"
import { validateMappingSet } from "./validate.js"
import { mappingSetSchema } from "./schemas.js"

export function inputFrom(input) {
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

export function parseMetadata(yaml) {
  const metadata = parse(yaml)
  for (let slot in metadata) {
    if (mappingSetSchema.properties[slot]?.type === "array" && !Array.isArray(metadata[slot])) {
      metadata[slot] = [metadata[slot]]
    }
  }
  return metadata
}

export async function readMetadata(metadata) {
  if (metadata?.constructor !== Object) {
    metadata = parseMetadata(await new Response(inputFrom(metadata)).text())
  }

  return validateMappingSet(metadata)
}
