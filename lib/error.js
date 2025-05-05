export class LocatedError extends Error {
  constructor(msg, position, value, cause) {
    super(msg, { cause })
    this.position = position
    this.value = value
  }

  toString() {
    let msg = this.message || "Error"
    if (this.position !== undefined) {
      msg += ` at ${this.position}`
    }
    if (this.value !== undefined) {
      msg += `: ${this.value}` 
    }
    return msg
  }
}
