import { isURI } from "./valid-uri.js"
import { mappingSchema, mappingSetSchema, $defs } from "./schemas.js"
import { DetailledError } from "./error.js"
import { buildIn } from "./curiemap.js"
import ncname from "ncname"

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
        throw new DetailledError(`${slot} must not include character |`, { value })
      }
      break
    case "EntityReference":
    case "Uri":
      if (!isURI(value)) {
        throw new DetailledError(`${slot} must be ${type}`, { value })
      }
      break
    case "Percentage":
      if (typeof value !== "number" || value<0 || value>1) {
        throw new DetailledError(`${slot} must be number between 0 and 1`, { value })
      } 
      break
    case "Date":
      if (!datePattern.test(value)) {
        // TODO: exclude feburary 29 for non leap-years?
        throw new DetailledError(`${slot} must be Date`, { value })
      }
      break
    case "EntityTypeEnum":
    case "MappingCardinality":
    case "PredicateModifier":
      if (!$defs[type].enum.includes(value)) {
        throw new DetailledError(`Invalid ${slot}`, { value })
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

export const validateCurie = (key, value) => {
  if (!ncname.test(key)) {
    throw new DetailledError("Invalid prefix", { value: key }) // TODO: position
  }

  validateValue(value, `curie_map ${key}`, { type: "Uri" })
  if (key in buildIn && value !== buildIn[key]) {
    const position = { jsonpointer: `/curie_map/${key}` }
    throw new DetailledError("IRI prefix must not be changed", { value, position })
  }
}

export const validateMappingSet = data => {
  data = validate(data, mappingSetSchema)    
  if (data.curie_map) {
    if (typeof data.curie_map !== "object") {
      throw new DetailledError("Invalid curie_map", { value: data.curie_map })
    }
    Object.entries(data.curie_map).forEach(args => validateCurie(...args))
  }
  return data
}

export const validateMapping = data => validate(data, mappingSchema)
