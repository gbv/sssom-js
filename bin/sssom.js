#!/usr/bin/env node

import cli from "../lib/cli.js"
import fs from "fs"
import { parseSSSOM, inputFormats, toJskosRegistry, toJskosMapping } from "../index.js"

const outputFormats = ["json","ndjson","jskos","ndjskos"]

cli.usage("sssom [options] [<mappings-file> [<metadata-file>]] ")
  .description("Parse and convert SSSOM")
  .option(`-f, --from FORMAT  input format (${inputFormats.join(", ")})`)
  .option(`-t, --to FORMAT    output format (${outputFormats.join(", ")})`)
  .option("-o, --output FILE  output file (default: - for stdout)")
  .option("-p, --propagate    add propagatable slots to mappings")
  .option("-c, --curie FILE   additional CURIE map (JSON or YAML file)")
  .option("-e, --empty        allow empty mappings block in SSSOM/TSV")
  .option("-m, --mappings     write mappings only")
  .option("-v, --verbose      verbose error messages")
  .option("-x, --errors       JSON error messages")
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

    if (options.to === "ndjson") {
      if (!options.mappings) options.metadataHandler = ndjson
      options.mappingHandler = ndjson
      return await parseSSSOM(input, options)
    } else if (options.to === "ndjskos") {
      if (!options.mappings) options.metadataHandler = metadata => ndjson(toJskosRegistry(metadata))
      options.mappingHandler = mapping => ndjson(toJskosMapping(mapping))
      return await parseSSSOM(input, options)
    } else { // jskos or sssom/json
      const result = await parseSSSOM(input, options)
      output.write(JSON.stringify(result || {}, null, 2)+"\n")
    }
  })
  .parse(process.argv)
  .catch(e => {
    if (cli.options.errors) {
      const { message, value, position } = e
      console.error(JSON.stringify({ message, value, position },null,2))
    } else {
      console.error(cli.options.verbose ? e : `${e}`)
    }
    process.exit(1)
  })
