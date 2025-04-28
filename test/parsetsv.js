import { expect } from "chai"
import { parseSSSOM } from "../index.js"
import { example } from "./example.js"

describe("parse SSSOM/TSV", () => {
  Object.entries({
    "one file": ["test/valid/example.sssom.tsv"],
    "two files (external metadata mode)": ["test/valid/example.sssom.mappings.tsv", { metadata: "test/valid/example.sssom.yml" }],
  }).forEach(([test, [input, options]]) => {
    it(test, async () => {
      options ||= {}
      options.from = "tsv"
      const result = await parseSSSOM(input, options)
      expect(result).to.deep.equal(example)
    })
  })

  it("minimal", async () => {
    const result = await parseSSSOM("test/valid/minimal.sssom.tsv")
    expect(result).to.be.a("object")
  })
})
