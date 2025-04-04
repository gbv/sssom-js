import cli from "../lib/cli.js"
import { parseTSV } from "../index.js"

cli.usage("sssom [options] [<mappings-file> [<metadata-file>]] ")
  .description("Parse and convert SSSOM/TSV")
  .option("-v, --verbose           verbose error messages")
  .action(async (args, options) => {
    const input = args.length ? args.shift() : "-"
    if (args.length) {
      options.metadata = args.shift()
    }

    // TODO: support more output formats
    options.metadataHandler = metadata => console.log(JSON.stringify(metadata || {}))
    options.mappingHandler = mapping => console.log(JSON.stringify(mapping))

    return process.exit(await parseTSV(input, options))
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
