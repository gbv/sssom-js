import { expect } from "chai"
import { parseSSSOM } from "../index.js"

import { example } from "./example.js"

describe("parseSSSOM", () => {
  Object.entries({
    "SSSOM/TSV": ["test/valid/example.sssom.tsv"],
    "SSSOM/JSON": ["test/valid/example.sssom.json", { from: "json" }],
    // TODO: external metadata mode
  }).forEach(([test, args]) => {
    it(test, async () => {
      expect(await parseSSSOM(...args)).to.deep.equal(example)
    })
  })
})
