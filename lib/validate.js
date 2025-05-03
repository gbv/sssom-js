import { isURI } from "./valid-uri.js"
import { mappingSchema, mappingSetSchema, $defs } from "./schemas.js"

// Implements a very limited subset of JSON Schema

const datePattern = new RegExp($defs.Date.regex)

function validateValue(value, slot, spec, asItem=false) {
  const type = spec.type || spec.$ref.split("/").pop()
    
  switch (type) {
    case "string":
      if (typeof value !== "string") {
        throw new Error(`${slot} must be string, got ${typeof value}`)
      }
      if (asItem && value.includes("|")) {
        throw new Error(`${slot} must not include character |, got ${value}`)
      }
      break
    case "EntityReference":
    case "Uri":
      if (!isURI(value)) {
        const got = type === "Uri" ? "value" : "Uri value"
        throw new Error(`${slot} must be ${type}, got ${got} ${value}`)
      }
      break
    case "Percentage":
      if (typeof value !== "number" || value<0 || value>1) {
        throw new Error(`${slot} must be number between 0 and 1, got ${value}`)
      } 
      break
    case "Date":
      if (!datePattern.test(value)) {
        // TODO: exclude feburary 29 for non leap-years?
        throw new Error(`${slot} must be Date, got value ${value}`)
      }
      break
    case "EntityTypeEnum":
    case "MappingCardinality":
    case "PredicateModifier":
      if (!$defs[type].enum.includes(value)) {
        throw new Error(`Invalid ${slot} value ${value}`)
      }
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
        value.forEach(v => validateValue(v, slot, spec.items, true))
        // by the way, arrays are always allowed to be empty
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
