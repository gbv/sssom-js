import { expect } from "chai"
import fs from "fs"
import { TSVReader } from "../index.js"

describe("TSVReader", () => {
  let reader
  afterEach(() => reader.removeAllListeners())

  Object.entries({
    "missing-mapping-slot.sssom.tsv": "Missing mapping slot in line 1: mapping_justification",
    "missing-mapping-slots.sssom.tsv": "Missing mapping slots in line 1: predicate_id, mapping_justification",
    "metadata-block.sssom.tsv": "Metadata line 2 has wrong number of space characters!",
    "empty-line.sssom.tsv": "Missing mapping slots in line 5: subject_id, predicate_id, object_id, mapping_justification",
  }).forEach(([file, message]) => {
    it(`should emit error for ${file}`, done => {
      reader = new TSVReader(fs.createReadStream(`test/invalid/${file}`))
      reader.on("error", err => {
        expect(err.message).to.equal(message)
        done()
      })
    })
  })
})
