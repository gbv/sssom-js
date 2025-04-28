# sssom-js

[![Test](https://github.com/gbv/sssom-js/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/sssom-js/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/sssom-js.svg?style=flat)](https://www.npmjs.org/package/sssom-js)

> Simple Standard for Sharing Ontology Mappings (SSOM) JavaScript library

This Node package provides methods and a command line client to process mappings in [SSSOM] format.

It implements parsing SSSOM (TSV and JSON) with validation and transformation to other SSSOM serializations and to [JSKOS] format.

[Propagation of mapping set slots](https://mapping-commons.github.io/sssom/spec-model/#propagation-of-mapping-set-slots) is not supported yet.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Command line](#command-line)
  - [API](#api)  
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install 

```bash
npm install sssom-js
```

Requires Node.js >= 20.19.

## Usage

### Command line

The package includes the command line client `sssom`:

~~~
Usage: sssom [options] [<mappings-file> [<metadata-file>]] 

Parse and convert SSSOM

Options:
  -f, --from FORMAT  input format (tsv, json)
  -t, --to FORMAT    output format (json, ndjson, jskos, ndjskos)
  -v, --verbose      verbose error messages
  -h, --help         output usage information
  -V, --version      output the version number
~~~

The following formats are supported:

format   | description   | support
---------|---------------|---------
`tsv`    | [SSSOM/TSV]   | from
`json`   | [SSSOM/JSON]  | from & to
`ndjson` | metadata and mappings on individual lines (SSSOM/JSON) | to
`jskos`  | [JSKOS]       | to
`ndjskos`| metadata and mappings on individual lines (JSKOS) | to 

If not specified, formats are guessed from file name with fallback to `tsv` (from) and `ndjson` (to).

Formats `json` and `jskos` require to fully load the input into memory for processing, the other formats support streaming processing.

### API

~~~js
import { parseSSSOM, TSVReader } from "sssom-js"
~~~

#### parseSSSOM (input, options)

This asynchronous function parses SSSOM in format `options.from` (`json`, or `tsv` as default) from a stream or file and returns a mapping set on success. The result should directly be serializable as SSSOM/JSON.

*Note that SSSOM/JSON has not been specified officially yet, so details may change!*

#### TSVReader

This event emitter parses [SSSOM/TSV] from a stream and emits `metadata` and `mapping` events:

~~~js
import fs from "fs"
import { TSVReader } from "./index.js"

const input = fs.createReadStream("test/valid/minimal.sssom.tsv")
new TSVReader(input)
  .on("metadata", console.log)
  .on("mapping", console.log)
  .on("error", console.error)
  .on("end", console.log)
~~~

## Maintainers

- [@nichtich](https://github.com/nichtich) (Jakob Voß)

## Contribute

Contributions are welcome! Best use [the issue tracker](https://github.com/gbv/sssom-js/issues) for questions, bug reports, and/or feature requests!

## License

MIT license

[SSSOM]: https://mapping-commons.github.io/sssom/
[SSSOM/TSV]: https://mapping-commons.github.io/sssom/spec-formats-tsv/
[SSSOM/JSON]: https://mapping-commons.github.io/sssom/spec-formats-json/
[JSKOS]: https://gbv.github.io/jskos/
