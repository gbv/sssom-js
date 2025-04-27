import { expect } from "chai"
import { parseTSV } from "../index.js"
import { example } from "./example.js"

describe("parseTSV", () => {
  Object.entries({
    "one file": ["test/valid/example.sssom.tsv"],
    "two files (external metadata mode)": ["test/valid/example.sssom.mappings.tsv", { metadata: "test/valid/example.sssom.yml" }],
  }).forEach(([test, args]) => {
    it(test, async () => {
      const result = await parseTSV(...args)
      expect(result).to.deep.equal(example)
    })
  })

  it("minimal", async () => {
    const result = await parseTSV("test/valid/minimal.sssom.tsv")
    expect(result).to.be.a("object")

  })
})
