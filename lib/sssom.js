import { TSVReader } from "../lib/tsvreader.js"
import fs from "fs"

function input(args) {
  if (args.length) {
    if (args[0] === "-") {
      args.pop()
    } else {
      return fs.createReadStream(args.pop())
    }
  }
  return process.stdin
}

export default async (args) => {
  return await new Promise((resolve, reject) => {
    const inputStream = input(args)
    const lineReader = new TSVReader(inputStream)

    lineReader.on("metadata", metadata => {
      console.log(JSON.stringify(metadata || {}))
    })

    lineReader.on("mapping", mapping => {
      console.log(JSON.stringify(mapping))
    })
    lineReader.on("error", err => {
      console.log("ERROR")
      if (err.code === "EPIPE") {
        resolve()
      } else {
        reject(err)
      }
    })

    lineReader.on("end", resolve)
  })
}
