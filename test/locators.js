import { expect } from "chai"
import { positionString, yamlPosition } from "../lib/locators.js"

describe("positionString", () => {
  const tests = [
    ["foo","foo"],
    [{jsonpointer:"/a/1"},"element /a/1"],
  ]
  tests.forEach(([pos, str]) => {
    it(str, () => {
      expect(positionString(pos)).to.equal(str)
    })
  })
})

describe("yamlPosition", () => {
  const yaml = `a: 1 
b:
  - 42
  - foo # comment
c: 
  2`
  const tests = {
    "/a": { line: 1, rfc5147: "line=0,1" },
    "/c": { line: 6, rfc5147: "line=5,6" },
    "/b/1": { line: 4, rfc5147: "line=3,4" },
    "/b": { rfc5147: "line=2,4" },
  }
  for (let [pointer, pos] of Object.entries(tests)) {
    it(pointer, () => {
      const got = yamlPosition(yaml, pointer)
      expect(got).to.deep.equal(pos)
    })
  }
})
