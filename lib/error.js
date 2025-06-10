import { positionString } from "./locators.js"

export class DetailledError extends Error {
  constructor(msg, { position, value, cause } ) {
    if (msg instanceof DetailledError) {
      position ??= msg.position
      value ??= msg.value
    }
    if (msg instanceof Error) {
      msg = msg.message
    }
    super(msg, { cause })
    this.position = position
    this.value = value
  }

  toString() {
    let msg = this.message || "Error"
    let pos = positionString(this.position)
    if (pos !== undefined) {
      msg += ` at ${pos}`
    }
    if (this.value !== undefined) {
      msg += `: ${this.value}` 
    }
    return msg
  }
}
