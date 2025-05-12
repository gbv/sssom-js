function positionString(pos) {
  if (typeof pos === "string") {
    return pos
  } else if (typeof pos === "object") {
    if (pos.line) {
      return `line ${pos.line}`
    } else if ("jsonpointer" in pos) {
      return `element ${pos.jsonpointer}`
    }
  }
}

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
