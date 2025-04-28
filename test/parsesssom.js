import { expect } from "chai"
import { parseSSSOM } from "../index.js"

import { example } from "./example.js"

const validFiles = ["array.sssom.tsv","minimal.sssom.tsv"]

describe("parseSSSOM", () => {
  Object.entries({
    "SSSOM/TSV": ["test/valid/example.sssom.tsv"],
    "SSSOM/JSON": ["test/valid/example.sssom.json", { from: "json" }],
    "SSSOM/JSON with external metadata": ["test/valid/example.mappings.json", { metadata: "test/valid/example.sssom.yml" }],
  }).forEach(([test, args]) => {
    it(test, async () => {
      const result = await parseSSSOM(...args)
      expect(result).to.deep.equal(example)
    })
  })
  
  validFiles.forEach(file => {
    it(file, async () => {
      const result = await parseSSSOM(`test/valid/${file}`)
      expect(result).to.be.a("object")
    })
  })

})
