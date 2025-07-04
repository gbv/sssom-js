#!/usr/bin/env node

import cli from "../lib/cli.js"
import fs from "fs"
import { parseSSSOM, inputFormats, toJskosRegistry, toJskosMapping } from "../index.js"
import { buildIn } from "../lib/curiemap.js"

const outputFormats = ["json","ndjson","jskos","ndjskos","nq"]

const { jsonld2rdf } = await import("jsonld2rdf").catch(()=>({}))
if (jsonld2rdf) {
  outputFormats.push("nt","ttl")
}

cli.usage("sssom [options] [<mappings-file> [<metadata-file>]] ")
  .description("Parse and convert SSSOM")
  .option(`-f, --from FORMAT   input format (${inputFormats.join(", ")})`)
  .option(`-t, --to FORMAT     output format (${outputFormats.join(", ")})`)
  .option("-o, --output FILE   output file (default: - for stdout)")
  .option("-p, --propagate     add propagatable slots to mappings")
  .option("-c, --curie FILE    additional CURIE map (JSON or YAML file)")
  .option("-b, --liberal       parse less strict than the specification")
  .option("-s, --schemes FILE  JSKOS concept schemes to detect")
  .option("-l, --language CODE language code (default: und)")
  .option("-m, --mappings      emit mappings only")
  .option("-v, --verbose       emit error verbosely")
  .option("-j, --json-errors   emit errors in JSON (Data Validation Error Format)")
  .action(async (args, options) => {
    const input = args.length ? args.shift() : "-"
    if (args.length) {
      options.metadata = args.shift()
    }

    var output = process.stdout
    const ndjson = data => output.write(JSON.stringify(data || {})+"\n")

    if (options.output) {
        options.to ??= options.output.split('.').pop()
        output = fs.createWriteStream(options.output)
    }

    if (!outputFormats.includes(options.to ??= "ndjson")) {
      throw new Error(`Unsupported output format ${options.to}`)
    }

    if (options.schemes) {
      const json = fs.readFileSync(options.schemes).toString() // TODO: allow "-"
      if (json.match(/^\s*\[/)) { // JSON array
        options.schemes = JSON.parse(json)
      } else { // NDJSON
        options.schemes = json.split("\n").filter(line => !line.match(/^\s*$/)).map(JSON.parse)
      }
    }

    if (options.to === "ndjson") {
      if (!options.mappings) options.metadataHandler = ndjson
      options.mappingHandler = ndjson
      return await parseSSSOM(input, options)
    } else if (options.to === "ndjskos") {
      if (!options.mappings) options.metadataHandler = metadata => ndjson(toJskosRegistry(metadata, options))
      options.mappingHandler = mapping => ndjson(toJskosMapping(mapping, options))
      return await parseSSSOM(input, options)
    } else if (options.to === "nq") {
      let graph
      options.metadataHandler = metadata => { graph = metadata.mapping_set_id }
      options.mappingHandler = ({subject_id, predicate_id, object_id}) => {
        const statement = [subject_id, predicate_id, object_id]
        if (graph) statement.push(graph)
        // We only support URI, so no escaping is required
        output.write(statement.map(uri => `<${uri}>`).join(" ")+" . \n")
      }
      return await parseSSSOM(input, options)
    } else {
      const result = await parseSSSOM(input, options)
      if (options.to === "nt" || options.to === "ttl") {
        const { default: context } = await import("../context.json",  { with: { type: "json" } })
        var prefixes
        if (options.to === "ttl") {
          prefixes = {
            ...buildIn, // TODO: use curie_map?
          }
          for (let s of ["dct","pav","prov"]) prefixes[s] = context[s]
        }
        output.write(await jsonld2rdf(result, { context, prefixes }))
      } else {
        output.write(JSON.stringify(result || {}, null, 2)+"\n")
      }
    }
  })
  .parse(process.argv)
  .catch(e => {
    if (cli.options["json-errors"]) {
      const { message, value, position } = e
      console.error(JSON.stringify({ message, value, position },null,2))
    } else {
      console.error(cli.options.verbose ? e : `${e}`)
    }
    process.exit(1)
  })
