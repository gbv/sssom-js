#!/usr/bin/env node

import cli from "../lib/cli.js"
import { parseSSSOM, inputFormats, toJskosRegistry, toJskosMapping } from "../index.js"

const outputFormats = ["json","ndjson","jskos","ndjskos"]
const printJSON = data => console.log(JSON.stringify(data || {}, null, 2))
const printNDJSON = data => console.log(JSON.stringify(data || {}))

cli.usage("sssom [options] [<mappings-file> [<metadata-file>]] ")
  .description("Parse and convert SSSOM")
  .option(`-f, --from FORMAT       input format (${inputFormats.join(", ")})`)
  .option(`-t, --to FORMAT         output format (${outputFormats.join(", ")})`)
  .option("-v, --verbose           verbose error messages")
  .action(async (args, options) => {
    const input = args.length ? args.shift() : "-"
    if (args.length) {
      options.metadata = args.shift()
    }

    if (!outputFormats.includes(options.to ??= "ndjson")) {
      throw new Error(`Unsupported output format ${options.to}`)
    }

    if (options.to === "ndjson") {
      options.metadataHandler = printNDJSON
      options.mappingHandler = printNDJSON
      return await parseSSSOM(input, options)
    } else if (options.to === "ndjskos") {
      options.metadataHandler = metadata => printNDJSON(toJskosRegistry(metadata))
      options.mappingHandler = mapping => printNDJSON(toJskosMapping(mapping))
      return await parseSSSOM(input, options)
    } else if (options.to === "jskos") {      
      printJSON(toJskosRegistry(await parseSSSOM(input, options)))
    } else {
      printJSON(await parseSSSOM(input, options))
    }
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
