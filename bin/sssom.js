import cli from "../lib/cli.js"
import { parseSSSOM, inputFormats } from "../index.js"
import { mapping2jskos } from "../lib/jskos.js"

const outputFormats = ["ndjson","json","jskos"]
const prettyJSON = data => JSON.stringify(data, null, 2)

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
    } else if (options.to === "jskos") {      
      const result = await parseSSSOM(input, options)
      // TODO: map metadata fields
      const jskos = { mappings: result.mappings.map(mapping2jskos) }
      console.log(prettyJSON(jskos))
    } else { // "json"
      const result = await parseSSSOM(input, options)
      console.log(prettyJSON(result))
    }
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
