import { EventEmitter } from "events"
import csv from "csv-parser"
import { parseMetadata } from "./input.js"
import { CurieMap } from "./curiemap.js"
import { validateMappingSet, validateMapping } from "./validate.js"
import { mappingSchema } from "./schemas.js"
import { DetailledError } from "./error.js"
import { propagate } from "./propagate.js"

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
  constructor(input, { metadata, collectMappings, curie, propagate } = {}) {
    super()
    this.input = input || { on() {} }
    this.remaining = ""
    this.lineNumber = 0
    this.metadataPrefix
    this.curie = curie
    this.failed = false
    this.tsv = csv({ separator: "\t" })
    this.metadataBlock = []
    this.collectMappings = collectMappings
    this.propagate = propagate
    if (metadata) {
      this.emitMetadata(metadata)
    }
    this.init()
  }

  emitError(error, { line, value } = {}) {
    this.failed = true
    const position = { line }
    this.emit("error", new DetailledError(error, { position, value }))
  }

  emitMetadata(metadata) {
    if (!this.failed) {
      try {
        if (!metadata) {
          metadata = parseMetadata(this.metadataBlock.join("\n")) || {}
        }
        this.metadata = validateMappingSet(metadata)

        // TODO: duplicated code
        if (this.collectMappings) {
          this.metadata.mappings = []
        } else {
          delete this.metadata.mappings
        }

        this.curieMap = new CurieMap(this.metadata.curie_map, this.curie)
        this.emit("metadata", this.metadata)
      } catch (error) {
        this.emitError(error)
      }
    }
    this.metadataBlock = null
  }

  parseEntityReference(value) {
    try {
      return this.curieMap.entityReference(value)
    } catch (e) {
      this.emitError(e, { line: this.lineNumber })
    }
  }

  emitMapping(mapping) {

    for (let [slot,value] of Object.entries(mapping)) {

      if (this.failed) {
        // stop on first malformed field
        break
      } else if (value === "") {
        // remove empty field
        delete mapping[slot]
      } else {
        // transform TSV field to data model
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

    if (!this.failed) {
      try {
        validateMapping(mapping)
      } catch(error) {
        this.emitError(error, { line: this.lineNumber })
      }        
    }
    
    if (!this.failed) {
      if (this.propagate) {
        mapping = propagate(this.metadata, mapping)
      }
      if (this.metadata.mappings) {
        this.metadata.mappings.push(mapping)
      }
      this.emit("mapping", mapping)
    }
  }

  onLine(line) {
    this.lineNumber++

    if (this.failed) {
      return
    } // avoid parsing the whole chunk

    if (this.metadataBlock) { // metadata block
      if (line[0] === "#") {
        if (!this.metadataPrefix) { // first line
          this.metadataPrefix = /# */.exec(line)[0]
        }
        if (line.startsWith(this.metadataPrefix)) {
          this.metadataBlock.push(line.slice(this.metadataPrefix.length))
        } else {
          this.emitError("Wrong number of prefix space characters", { line: this.lineNumber })
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
      }
      if (this.metadataBlock) {
        if (!this.metadataBlock.length) {
          this.emitError("Input is empty", { line: 1 })
        }
        this.emitMetadata()
      }
      this.emit("end", this.metadata)
    })

    this.tsv.on("error", this.emitError)

    this.tsv.on("headers", headers => {
      const missing = mappingSchema.required.filter(slot => !headers.includes(slot))
      if (missing.length == 1) {
        this.emitError("Missing mapping slot", { line: this.lineNumber, value: missing[0] }) 
      } else if (missing.length > 1) {
        this.emitError("Missing mapping slots", { line: this.lineNumber, value: missing.join(", ") }) 
      }
    })

    this.tsv.on("data", data => this.emitMapping(data))
  }
}
