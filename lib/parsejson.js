import consumers from "stream/consumers"
import { inputFrom, readMetadata } from "./input.js"
import { validateMappingSet, validateMapping } from "./validate.js"

export const parseJSON = async (input, options) => {
  const { metadataHandler, mappingHandler } = options

  let { mappings, ...metadata } = await consumers.json(inputFrom(input))

  // overrride metadata with external metadata
  if (options.metadata) {
    metadata = await readMetadata(options.metadata)
  } else {
    validateMappingSet(metadata)
  }

  // TODO: extend with propagateable slots
  mappings.forEach(validateMapping)

  if (metadataHandler) {
    metadataHandler(metadata)
  }
  if (mappingHandler && mappings) {
    mappings.forEach(mappingHandler)
  }
  return { mappings, ...metadata }
}
