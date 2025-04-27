import { expect } from "chai"
import fs from "fs"
import { TSVReader } from "../index.js"

import { example } from "./example.js"

describe("TSVReader", () => {
  let reader
  afterEach(() => reader.removeAllListeners())

  Object.entries({
    "missing-mapping-slot.sssom.tsv": "Missing mapping slot in line 3: mapping_justification",
    "missing-mapping-slots.sssom.tsv": "Missing mapping slots in line 3: predicate_id, mapping_justification",
    "metadata-block.sssom.tsv": "Metadata line 2 has wrong number of space characters!",
    "empty-line.sssom.tsv": "Missing mapping slots in line 7: subject_id, predicate_id, object_id, mapping_justification",
    "curie.sssom.tsv": "Unknown or invalid CURIE 'x:1' in line 4",
    "license.sssom.tsv": "Missing metadata slot: license",
    empty: "Input is empty",
  }).forEach(([file, message]) => {
    it(`should emit error for ${file}`, done => {
      reader = new TSVReader(fs.createReadStream(`test/invalid/${file}`))
      reader.on("error", err => {
        expect(err.message).to.equal(message)
        done()
      })
    })
  })

  it("should parse example SSSOM/TSV", done => {
    reader = new TSVReader(fs.createReadStream("test/valid/example.sssom.tsv"))
    const result = { mappings: [] }
    reader.on("metadata", metadata => Object.assign(result, metadata))
    reader.on("mapping", mapping => result.mappings.push(mapping))
    reader.on("end", metadata => {
      expect(result).to.deep.equal(example)
      const { mappings, ...rest } = result // eslint-disable-line
      expect(metadata).to.deep.equal(rest)
      done()
    })
  })
})
