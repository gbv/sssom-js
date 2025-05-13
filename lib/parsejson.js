import { inputFrom, readMetadata } from "./input.js"
import { validateMappingSet, validateMapping } from "./validate.js"
import { propagate } from "./propagate.js"
import { sssomOrJskos } from "./jskos.js"

const _parseInput = async input => 
  input ? await (new Response(inputFrom(input))).json() : { mappings: [] }

export const parseJSON = async (input, options) => {
  const { metadataHandler, mappingHandler } = options

  let { mappings, ...metadata } = await _parseInput(input)

  if (options.metadata) {
    metadata = await readMetadata(options.metadata)
  } else {
    validateMappingSet(metadata)
  }

  if (metadataHandler) {
    metadataHandler(metadata)
  }
  
  mappings.forEach(validateMapping)
  if (options.propapage) {
    mappings = mappings.map(mapping => propagate(metadata, mapping))
  }

  if (mappingHandler && mappings) {
    mappings.forEach(mappingHandler)
  }

  const result = options.mappings ? { mappings } : { mappings, ...metadata }
  return sssomOrJskos(result, options.to)
}
