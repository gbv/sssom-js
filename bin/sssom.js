#!/usr/bin/env node

import cli from "../lib/cli.js"
import { parseSSSOM, inputFormats } from "../index.js"
import { set2jskos, mapping2jskos } from "../lib/jskos.js"

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
      options.metadataHandler = metadata => printNDJSON(set2jskos(metadata))
      options.mappingHandler = mapping => printNDJSON(mapping2jskos(mapping))
      return await parseSSSOM(input, options)
    } else if (options.to === "jskos") {      
      printJSON(set2jskos(await parseSSSOM(input, options)))
    } else {
      printJSON(await parseSSSOM(input, options))
    }
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
