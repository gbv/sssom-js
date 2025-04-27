import uri from "fast-uri"
import { mappingSchema, mappingSetSchema } from "./schemas.js"


export function validateMetadata(metadata) {
  // TODO: support multi-valued slots with a single value
  // TODO: validate fields (type, repeatability...)
  
  mappingSetSchema.required.forEach(field => {
    if (!metadata[field]) {
      throw new Error(`Missing metadata slot: ${field}`)
    }
  })

  return metadata
}

export function validateMapping(mapping) {
  for (let [slot,value] of Object.entries(mapping)) {
    const spec = mappingSchema.properties[slot]
    if (!spec) {
      continue
    }

    // This implements a very limited subset of JSON Schema with known schema

    if (spec.$ref === "#/$def/EntityReference" || spec.$ref === "#/$defs/Uri") {
      uri.parse(value)
      // TODO: check for error. requires url.domainToASCII, not available in Node 20!
    } else if (spec.$ref === "#/$defs/Percentage") {
      if (typeof value !== "number" || value<0 || value>1) {
        throw new Error(`${slot} must be number between 0 and 1, got ${typeof value} ${value}`)
      } 
    } else if (spec.type === "array") {
      // TODO
    }
  }
}
