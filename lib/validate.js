import uri from "fast-uri"
import { mappingSchema, mappingSetSchema } from "./schemas.js"

// Implements a very limited subset of JSON Schema

function validateValue(value, slot, spec) {
  const type = spec.type || spec.$ref.split("/").pop()
    
  if (type === "string") {
    if (typeof value !== "string") {
      throw new Error(`${slot} must be string, got ${typeof value}`)
    }
  } else if (type === "EntityReference" || type === "Uri") {
    const iri = uri.parse(value)
    if ((iri.error && !iri.error.match(/URL\.domainToASCII/)) ||
          (iri.reference !== "absolute" && iri.reference !== "uri") ||
            uri.serialize(iri) !== value) {
      const got = type === "Uri" ? "value" : "Uri value"
      throw new Error(`${slot} must be ${type}, got ${got} ${value}`)
    }
  } else if (type === "Percentage") {
    if (typeof value !== "number" || value<0 || value>1) {
      throw new Error(`${slot} must be number between 0 and 1, got ${value}`)
    } 
  } else {
    // TODO: Date, EntityTypeEnum, PredicateModifier, MappingCardinality
  }
}

export function validate(data, schema) {

  schema.required.filter(field => !data[field]).forEach(field => {
    throw new Error(`Missing ${schema.title} slot: ${field}`)
  })

  for (let [slot,value] of Object.entries(data)) {
    const spec = schema.properties[slot]
    if (!spec || slot === "mappings") {
      continue
    }

    if (spec.type === "array") {
      if (Array.isArray(value)) {
        value.forEach(v => validateValue(v, slot, spec.items))
      } else {
        throw new Error(`${slot} must be array`)
      }
    } else {
      validateValue(value, slot, spec)
    }
  }

  return data
}

export const validateMappingSet = data => validate(data, mappingSetSchema)

export const validateMapping = data => validate(data, mappingSchema)
