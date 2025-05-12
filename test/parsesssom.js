import { expect } from "chai"
import { parseSSSOM } from "../index.js"

import { example } from "./example.js"

const metadata = "test/valid/example.sssom.yml"

const validFiles = ["array.sssom.tsv","minimal.sssom.tsv"]
describe("parseSSSOM", () => {
  Object.entries({
    "SSSOM/TSV": ["test/valid/example.sssom.tsv"],
    "SSSOM/JSON": ["test/valid/example.sssom.json", { from: "json" }],
    "SSSOM/JSON with external metadata": ["test/valid/example.mappings.json", { metadata }],
  }).forEach(([test, args]) => {
    it(test, async () => {
      const result = await parseSSSOM(...args)
      expect(result).to.deep.equal(example)
    })
  })

  it("curie", async () => {
    const result = await parseSSSOM("test/invalid/curie.sssom.tsv", { curie: { x: "ex:"} } )
    expect(result).to.be.a("object")
  })

  it("metadata only, falsy input", async () => {
    const result = await parseSSSOM(false, { metadata })
    const { mappings, ...mappingSet } = example // eslint-disable-line
    expect(result).to.deep.equal(mappingSet)
  })

  validFiles.forEach(file => {
    it(file, async () => {
      const result = await parseSSSOM(`test/valid/${file}`)
      expect(result).to.be.a("object")
    })
  })
})
