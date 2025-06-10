import { expect } from "chai"
import fs from "fs"
import { TSVReader } from "../index.js"

import { example } from "./example.js"

describe("TSVReader", () => {
  let reader
  afterEach(() => reader.removeAllListeners())

  Object.entries({
    "missing-mapping-slot.sssom.tsv": "Missing mapping slot at line 3: mapping_justification",
    "missing-mapping-slots.sssom.tsv": "Missing mapping slots at line 3: predicate_id, mapping_justification",
    "metadata-block.sssom.tsv": "Wrong number of prefix space characters at line 2",
    "empty-line.sssom.tsv": "Missing mapping slots at line 7: subject_id, predicate_id, object_id, mapping_justification",
    "curie.sssom.tsv": "Unknown or invalid CURIE at line 4: x:1",
    "license.sssom.tsv": "Missing MappingSet slot: license",
    "percent.sssom.tsv": "similarity_score must be number between 0 and 1 at line 6: 1.2",
    "uri.sssom.tsv": "license must be Uri at line 2: GPL",
    "array-value.sssom.tsv": "see_also must be Uri at line 3: //example.org/",
    "date.sssom.tsv": "mapping_date must be Date at line 3: 2020-13-01",
    "enum.sssom.tsv": "Invalid subject_type at line 3: x",
    "eol.sssom.tsv": "Missing MappingSet slot: mapping_set_id",
    "empty.sssom.tsv": "Input is empty at line 1",
    "metadata-only.sssom.tsv": "Missing mappings block",
  }).forEach(([file, message]) => {
    it(`should emit error for ${file}`, done => {
      reader = new TSVReader(fs.createReadStream(`test/invalid/${file}`))
      reader.on("error", err => {
        expect(err.toString()).to.equal(message)
        done()
      })
    })
  })

  for (let file of ["test/invalid/license.sssom.tsv", "test/invalid/liberal.sssom.tsv"]) {
    it(`should parse liberal: ${file}`, done => {
      const reader = new TSVReader(fs.createReadStream(file), { liberal: true })
      reader.on("end", res => {
        expect(res).to.be.ok
        done()
      })
    })
  }

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
