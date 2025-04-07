import { EventEmitter } from "events"
import csv from "csv-parser"
import { parse } from "yaml"
import { CurieMap } from "./curiemap.js"
import { validateMetadata, validateMapping } from "./validate.js"
import { mappingSchema } from "./schemas.js"

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
  constructor(input, { metadata, collectMappings } = {}) {
    super()
    this.input = input
    this.remaining = ""
    this.lineNumber = 0
    this.prefix
    this.failed = false
    this.tsv = csv({ separator: "\t" })
    this.metadataBlock = []
    this.collectMappings = collectMappings
    if (metadata) {
      this.emitMetadata(metadata)
    }
    this.init()
  }

  emitError(error) {
    this.failed = true
    this.emit("error", typeof error === "string" ? new Error(error) : error)
  }

  emitMetadata(metadata) {
    try {
      if (!metadata) {
        metadata = parse(this.metadataBlock.join("\n")) || {}
      }
      this.metadata = validateMetadata(metadata)

      // TODO: duplicated code
      if (this.collectMappings) {
        this.metadata.mappings = []
      } else {
        delete this.metadata.mappings
      }

      this.curieMap = new CurieMap(this.metadata.curie_map)
      this.emit("metadata", this.metadata)
    } catch (error) {
      this.emitError(error)
    }
    this.metadataBlock = null
  }

  parseEntityReference(value) {
    const iri = this.curieMap.getIri(value)
    if (iri) {
      return iri
    } else {
      this.emitError(`Unknown or invalid CURIE in line ${this.lineNumber}: ${value}`)
    }
  }

  emitMapping(mapping) {
    for (let [slot,value] of Object.entries(mapping)) {
      if (value === "") {
        // remove empty field
        delete mapping[slot]
      } else {
        const spec = mappingSchema.properties[slot] || {}
        if (spec.$ref === "#/$def/EntityReference") {
          mapping[slot] = this.parseEntityReference(value)
        } else if (spec.$ref === "#/$defs/Percentage") {
          if (value.match(/^(0(\.[0-9]+)?|1(\.0+)?)$/)) {
            mapping[slot] = parseFloat(value)
          }
        } else if (spec.type === "array") {
          mapping[slot] = value.split("|")
          if (spec.items?.$ref === "#/$def/EntityReference") {
            mapping[slot] = mapping[slot].map(value => this.parseEntityReference(value))
          }
        }
      }
    }

    validateMapping(mapping)

    if (this.metadata.mappings) {
      this.metadata.mappings.push(mapping)
    }
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
        if (!this.metadataBlock.length) {
          this.emitError("Input is empty")
        }
        this.emitMetadata()
      }
      this.emit("end", this.metadata)
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
