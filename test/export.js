import { expect } from "chai"
import { TSVReader } from "../index.js"

describe("export", () => {
  it("should export TSVReader", () => {
    expect(TSVReader).to.be.a("function")
  })
})
