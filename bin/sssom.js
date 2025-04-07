import cli from "../lib/cli.js"
import { parseSSSOM, inputFormats } from "../index.js"

const outputFormats = ["ndjson","json"]

cli.usage("sssom [options] [<mappings-file> [<metadata-file>]] ")
  .description("Parse and convert SSSOM/TSV")
  .option("-v, --verbose           verbose error messages")
  .option(`-f, --from FORMAT       input format (${inputFormats.join(", ")})`)
  .option(`-t, --to FORMAT         output format (${outputFormats.join(", ")})`)
  .action(async (args, options) => {
    const input = args.length ? args.shift() : "-"
    if (args.length) {
      options.metadata = args.shift()
    }

    if (!outputFormats.includes(options.to ??= "ndjson")) {
      throw new Error(`Unsupported output format ${options.to}`)
    }

    if (options.to === "ndjson") {
      options.metadataHandler = metadata => console.log(JSON.stringify(metadata || {}))
      options.mappingHandler = mapping => console.log(JSON.stringify(mapping))
      return await parseSSSOM(input, options)
    } else { // "json"
      const result = await parseSSSOM(input, options)
      console.log(JSON.stringify(result, null, 2))
    }
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
