import { propagatableSlots } from "./schemas.js"

export const propagate = (metadata, mapping) => {
  for (let slot in propagatableSlots) {
    if (slot in metadata) {
      // TODO: warn/error if slot in mapping with different value?
      mapping[slot] = metadata[slot]
    }
  }
  return mapping
}
