import { inputFrom, readMetadata } from "./input.js"
import { validateMappingSet, validateMapping } from "./validate.js"
import { DetailledError } from "./error.js"
import { propagate } from "./propagate.js"
import { sssomOrJskos } from "./jskos.js"

const _parseInput = async input => {
  if (input) {
    input = inputFrom(input)
    // we don't use .json() to better support browser and error handling
    const data = []
    for await (const chunk of input) {
      data.push(chunk)
    }
    try {
      return JSON.parse(data.join(""))
    } catch (e) {
      let message = e.message
      let position = {}
      // JSON parsing error message format depends on the JavaScript engine.
      // This catches "(line 1 column 6)" and "at line 1 column 6".
      let match = message.match(/line ([0-9]+) column ([0-9]+)/)
      if (match) {
        message = message.replace(/line [0-9]+ /,"")
        position.line = match[1] // TODO: column
      }        
      throw new DetailledError(message, { position })
    }
  }
  return { mappings: [] }
}

export const parseJSON = async (input, options) => {
  const { metadataHandler, mappingHandler } = options

  // TODO: keep input string to get error locations
  let { mappings, ...metadata } = await _parseInput(input)

  if (options.metadata) {
    metadata = await readMetadata(options.metadata, options)
  } else {
    validateMappingSet(metadata, options.liberal)
  }

  if (metadataHandler) {
    metadataHandler(metadata)
  }
  
  mappings.forEach(m => validateMapping(m, options.liberal))
  if (options.propapage) {
    mappings = mappings.map(mapping => propagate(metadata, mapping))
  }

  if (mappingHandler && mappings) {
    mappings.forEach(mappingHandler)
  }

  const result = options.mappings ? { mappings } : { mappings, ...metadata }
  return sssomOrJskos(result, options)
}
