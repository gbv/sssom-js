import consumers from "stream/consumers"
import { inputFrom } from "./input.js"
import { validateMetadata, validateMapping } from "./validate.js"

export const parseJSON = async (input, options) => {
  const { metadataHandler, mappingHandler } = options
  // TODO: support external metadata

  const { mappings, ...metadata } = await consumers.json(inputFrom(input))

  validateMetadata(metadata)
  mappings.forEach(validateMapping)

  if (metadataHandler) {
    metadataHandler(metadata)
  }
  if (mappingHandler && mappings) {
    mappings.forEach(mappingHandler)
  }
  return { mappings, ...metadata }
}
