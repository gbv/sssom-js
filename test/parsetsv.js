import { expect } from "chai"
import { parseTSV } from "../index.js"

describe("parseTSV", () => {
  Object.entries({
    "one file": ["test/valid/example.sssom.tsv"],
    "two files (external metadata mode)": ["test/valid/example.sssom.mappings.tsv", { metadata: "test/valid/example.sssom.yml" }],
  }).forEach(([test, args]) => {
    it(test, async () => {
      const result = await parseTSV(...args)
      expect(result).to.be.a("object")
      expect(result.mappings?.length).to.equal(4)
      // TODO: compare with expected value
    })
  })
})
