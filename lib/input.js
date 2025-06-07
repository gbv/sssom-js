import fs from "fs"
import { parse } from "yaml"
import { CurieMap } from "./curiemap.js"
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
    // Allow single value where array is expected
    if (mappingSetSchema.properties[slot]?.type === "array" && !Array.isArray(metadata[slot])) {
      metadata[slot] = [metadata[slot]]
    }
  }
  return metadata
}

export function parseSlotValue(slot, value, schema, curieMap) {
  const spec = schema.properties[slot] || {}
  if (spec.$ref === "#/$defs/EntityReference") {
    return curieMap.entityReference(value)
  } else if (spec.$ref === "#/$defs/Percentage") {
    if (value.match(/^(0(\.[0-9]+)?|1(\.0+)?)$/)) {
      return parseFloat(value)
    }
  } else if (spec.type === "array") {
    value = Array.isArray(value) ? value : value.split("|").filter(Boolean)
    if (spec.items?.$ref === "#/$defs/EntityReference") {
      value = value.map(value => curieMap.entityReference(value))
    }
  }
  return value
}

// Parse metadata block from file/stream or object
export async function readMetadata(metadata, { liberal, curie }) {
  if (metadata?.constructor !== Object) {
    metadata = parseMetadata(await new Response(inputFrom(metadata)).text())
  }

  const curieMap = new CurieMap(metadata.curie_map, curie)
  Object.entries(metadata).forEach(([slot,value]) => {
    metadata[slot] = parseSlotValue(slot, value, mappingSetSchema, curieMap)
  })
  
  return validateMappingSet(metadata, liberal)
}
