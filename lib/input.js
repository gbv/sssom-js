import fs from "fs"
import { parse } from "yaml"
import { validateMetadata } from "./validate.js"

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

export async function readMetadata(metadata) {
  if (metadata?.constructor !== Object) {
    metadata = parse(await new Response(inputFrom(metadata)).text())
  }
  return validateMetadata(metadata)
}


