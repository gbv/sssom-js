import { expect } from "chai"
import fs from "fs"
import { parseSSSOM } from "../index.js"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)

const files = fs.readdirSync("test/valid").filter(file => file.endsWith(".jskos.json"))
  .map(file => [file, require(`./valid/${file}`)])

describe("SSSOM to JSKOS", () => {
  for (let [file, jskos] of files) {
    const tsv = "test/valid/" + file.replace(".jskos.json",".sssom.tsv")
    it(file, async () => {
      const result = await parseSSSOM(tsv, { to: "jskos" })
      expect(result).to.deep.equal(jskos)
    })
  }
})

describe("SSSOM with schemes", () => {
  const schemes = [
    { uri: "http://example.org/ontology/foo", namespace: "http://example.org/foo" },
    { uri: "http://example.org/ontology/bar", namespace: "http://example.org/bar" },
  ]
  const tsv = "test/valid/schemes.sssom.tsv"
  it(tsv, async () => {
    const result = await parseSSSOM(tsv, { to: "jskos", schemes })
    expect(result).to.deep.equal(require("./valid/schemes.sssom.json"))
  })
})
