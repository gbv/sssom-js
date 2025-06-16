import * as chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

// import { DetailledError } from "../lib/error.js"
import { parseSSSOM } from "../index.js"
import { example, require } from "./example.js"

chai.config.truncateThreshold = 0

const validFiles = ["array.sssom.tsv","minimal.sssom.tsv","schemes.sssom.tsv"]

describe("parseSSSOM", () => {
  const metadata = "test/valid/example.metadata.yml"

  Object.entries({
    "SSSOM/TSV": ["test/valid/example.sssom.tsv"],
    "SSSOM/CSV": ["test/valid/example.sssom.csv"],
    "SSSOM/JSON": ["test/valid/example.sssom.json", { from: "json" }],
    "SSSOM/JSON with external metadata": ["test/valid/example.mappings.json", { metadata }],
    "SSSOM/TSV with external metadata file": ["test/valid/example.sssom.mappings.tsv", { metadata }],
  }).forEach(([test, args]) => {
    it(test, async () => {
      const result = await parseSSSOM(...args)
      expect(result).to.deep.equal(example)
    })
  })

  it("curie", async () => {
    const result = await parseSSSOM("test/invalid/curie.sssom.tsv", { curie: { x: "ex:"} } )
    expect(result).to.be.a("object")
  })

  it("curie expansion", async () => {
    const result = await parseSSSOM("test/valid/curie-expand.sssom.tsv")
    expect(result).to.deep.equal(require("./valid/curie-expand.sssom.json"))
  })

  it("metadata only, falsy input", async () => {
    const result = await parseSSSOM(false, { metadata })
    const { mappings, ...mappingSet } = example // eslint-disable-line
    expect(result).to.deep.equal(mappingSet)
  })

  validFiles.forEach(file => {
    it(file, async () => {
      const result = await parseSSSOM(`test/valid/${file}`)
      expect(result).to.be.a("object")
    })
  })

  it("full example", async () => {
    const tsv = await parseSSSOM("test/valid/full.sssom.tsv")
    const json = await parseSSSOM("test/valid/full.sssom.json")
    expect(tsv).to.deep.equal(json)
  })

  // FIXME: chai-as-promised seems to not compare as expected
  let file = "build-in-curie.yml"
  let message = "IRI prefix must not be changed"
  //const error = new DetailledError(message, { position: { jsonpointer: "/curie_map/rdf" }, value: "http://example.org" }) 
  let error = message
  it(`should emit error for ${file}`, async () =>
    expect(parseSSSOM("", { metadata: `test/invalid/${file}` })).to.eventually.be.rejectedWith(error))

  file = "curie-prefix.yml"
  error = "Invalid prefix"
  it(`should emit error for ${file}`, async () =>
    expect(parseSSSOM("", { metadata: `test/invalid/${file}` })).to.eventually.be.rejectedWith(error))

})
