import fs from "fs"

export function inputFrom(input) {
  if (input === "-") {
    return process.stdin
  } else if (typeof input === "string") {
    return fs.createReadStream(input)
  } else if (typeof input?.on === "function") {
    return input
  } else {
    throw new Error("Input must be filename, '-', or readable stream!")
  }
}
