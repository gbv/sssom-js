import { EventEmitter } from "events"
import { parse } from "yaml"
import csv from "csv-parser"
import { CurieMap } from "./curiemap.js"

const requiredMappingSlots = ["subject_id","predicate_id","object_id","mapping_justification"]

/**
 * Parse SSSOM/TSV serialisation format as specified at
 * <https://mapping-commons.github.io/sssom/spec-formats-tsv/>
 *
 * Events:
 * - metadata (object)
 * - mapping (object)
 * - error
 * - end
 */
export class TSVReader extends EventEmitter {
  constructor(input) {
    super()
    this.input = input
    this.remaining = ""
    this.lineNumber = 0
    this.prefix
    this.metadataBlock = []
    this.failed = false
    this.metadata = {}
    this.tsv = csv({ separator: "\t" })
    this.init()
  }

  emitError(error) {
    this.failed = true
    this.emit("error", typeof error === "string" ? new Error(error) : error)
  }

  emitMetadata() {
    try {
      this.metadata = parse(this.metadataBlock.join("\n")) || {}
      // TODO: support multi-valued slots with a single value
      // TODO: validate fields (type, repeatability...)
      this.curieMap = new CurieMap(this.metadata.curie_map)
      this.emit("metadata", this.metadata)
    } catch (error) {
      this.emitError(error) // YAML parsing error
    }
    this.metadataBlock = null
  }

  emitMapping(mapping) {
    // TODO: split values, support more and repeatable fields
    // author_id, reviewer_id, creator_id, curation_rule, subject_match_field...
    for (let slot of ["subject_id","object_id","predicate_id","mapping_justification", "subject_source", "object_type", "object_source", "mapping_source", "issue_tracker_item"]) {
      if (mapping[slot]) {
        // TODO: allow raw IRI?
        const iri = this.curieMap.getIri(mapping[slot])
        if (iri) {
          mapping[slot] = iri
        } else {
          this.emitError(`Unknown or invalid CURIE in line ${this.lineNumber}: ${mapping[slot]}`)
        }
      }
    }
    // TODO: remove empty fields
    this.emit("mapping", mapping)
  }

  onLine(line) {
    this.lineNumber++

    if (this.failed) {
      return
    } // avoid parsing the whole chunk

    if (this.metadataBlock) { // metadata block
      if (line[0] === "#") {
        if (!this.prefix) { // first line
          this.prefix = /# */.exec(line)[0]
        }
        if (line.startsWith(this.prefix)) {
          this.metadataBlock.push(line.slice(this.prefix.length))
        } else {
          this.emitError(`Metadata line ${this.lineNumber} has wrong number of space characters!`)
          this.failed = true
        }
        return
      } else {
        this.emitMetadata()
      }
    }

    this.tsv.write(line + "\n")
  }

  init() {
    this.input.on("data", chunk => {
      this.remaining += chunk
      let index
      while ((index = this.remaining.indexOf("\n")) > -1) {
        const line = this.remaining.slice(0, index)
        this.remaining = this.remaining.slice(index + 1)
        this.onLine(line)
      }
    })

    this.input.on("end", () => {
      if (this.remaining.length > 0) {
        this.onLine(this.remaining)
      } else if (this.metadataBlock) {
        this.emitMetadata()
      }
      this.emit("end")
    })

    this.tsv.on("error", this.emitError)

    this.tsv.on("headers", headers => {
      const missing = requiredMappingSlots.filter(slot => !headers.includes(slot))
      if (missing.length == 1) {
        this.emitError(`Missing mapping slot in line ${this.lineNumber}: ${missing[0]}`) 
      } else if (missing.length > 1) {
        this.emitError(`Missing mapping slots in line ${this.lineNumber}: ${missing.join(", ")}`) 
      }
    })

    this.tsv.on("data", data => this.emitMapping(data))
  }
}
