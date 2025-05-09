import { inputFrom, readMetadata } from "./input.js"
import { validateMappingSet, validateMapping } from "./validate.js"
import { propagate } from "./propagate.js"

export const parseJSON = async (input, options) => {
  const { metadataHandler, mappingHandler } = options

  let { mappings, ...metadata } = await (new Response(inputFrom(input))).json()

  // overrride metadata with external metadata
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
  return { mappings, ...metadata }
}
