import { isURI } from "./valid-uri.js"
import { mappingSchema, mappingSetSchema, $defs } from "./schemas.js"
import { LocatedError } from "./error.js"

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
        throw new LocatedError(`${slot} must not include character |`, undefined, value)
      }
      break
    case "EntityReference":
    case "Uri":
      if (!isURI(value)) {
        throw new LocatedError(`${slot} must be ${type}`, undefined, value)
      }
      break
    case "Percentage":
      if (typeof value !== "number" || value<0 || value>1) {
        throw new LocatedError(`${slot} must be number between 0 and 1`, undefined, value)
      } 
      break
    case "Date":
      if (!datePattern.test(value)) {
        // TODO: exclude feburary 29 for non leap-years?
        throw new LocatedError(`${slot} must be Date`, undefined, value)
      }
      break
    case "EntityTypeEnum":
    case "MappingCardinality":
    case "PredicateModifier":
      if (!$defs[type].enum.includes(value)) {
        throw new LocatedError(`Invalid ${slot}`, undefined, value)
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
