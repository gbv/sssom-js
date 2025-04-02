import cli from "../lib/cli.js"
import sssom from "../lib/sssom.js"

cli.usage("sssom [options] [<file1> [<file2>]] ")
  .description("Parse and convert SSSOM/TSV")
  .option("-v, --verbose           verbose error messages")
  .action(async (args, opt) => process.exit(await sssom(args, opt)))
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.verbose ? e : `${e}`)
    process.exit(1)
  })
