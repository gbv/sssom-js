import { EventEmitter } from "events"
import { parse } from "yaml"

/**
 * Parse SSSOM/TSV serialisation format as specified at
 * <https://mapping-commons.github.io/sssom/spec-formats-tsv/>
 *
 * Events:
 * - metadata (object or null)
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
    this.metadata = []
    this.failed = false
    this.columns
    this.init()
  }

  emitError(error) {
    this.failed = true
    this.emit("error", error)
  }

  emitMetadata() {
    try {
      const metadata = parse(this.metadata.join("\n"))
      // TODO: support multi-valued slots with a single value
      // TODO: ignore or warn on unknown slots
      this.emit("metadata", metadata)
    } catch (error) {
      // YAML parsing error
      this.emitError(error)
    }
    this.metadata = null
  }

  onLine(line) {
    this.lineNumber++

    if (this.failed) {
      return
    }

    if (this.metadata) { // metadata block
      if (line[0] === "#") {
        if (!this.prefix) { // first line
          this.prefix = /# */.exec(line)[0]
        }
        if (line.startsWith(this.prefix)) {
          this.metadata.push(line.slice(this.prefix.length))
        } else {
          this.emitError(new Error(`Metadata block line ${this.lineNumber} has wrong number of space characters!`))
          this.failed = true
        }
      } else {
        this.emitMetadata()
        this.columns = line.split("\t")
        // TODO: error on unknown column names?
      }
    } else if (line.length > 0) { // ignore empty lines (including trailing newline at the end)
      const mapping = {}

      // TODO: this won't work with tabs in quoted values
      const cols = line.split("\t")
      for (let i=0; i<this.columns.length && i<cols.length; i++) {
        let value = cols[i]
        if (value !== "\"" && value[0] === "\"" && value.slice(-1) == "\"") {
          value = value.slice(1,-1) //TODO: unescape "" => " and "\t => \t
        }
        mapping[this.columns[i]] = value
        // TODO: split values in multi-valued slots
        // TODO: ignore unknown slot names or raise an error
      }
      this.emit("mapping", mapping)
    }
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
      } else if (this.metadata) {
        this.emitMetadata()
      }
      this.emit("end")
    })
  }
}
