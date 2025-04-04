import { expect } from "chai"
import { parseTSV } from "../index.js"

describe("parseTSV", () => {
  it("should parse SSSOM/TSV", async function() {
    const result = await parseTSV("test/valid/example.sssom.tsv")     
    expect(result).to.be.a("object")
    expect(result.mappings?.length).to.equal(4)
    // TODO: compare with expected value
  })
})
