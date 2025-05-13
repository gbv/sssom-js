# sssom-js

[![Test](https://github.com/gbv/sssom-js/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/sssom-js/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/sssom-js.svg?style=flat)](https://www.npmjs.org/package/sssom-js)

> Simple Standard for Sharing Ontology Mappings (SSOM) JavaScript library

This Node package provides methods and a command line client to process mappings in [SSSOM] format.

It implements parsing SSSOM (TSV and JSON) with validation and transformation to other SSSOM serializations and to [JSKOS] format.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Command line](#command-line)
  - [API](#api)  
  - [Validation errors](#validation-errors)
  - [Web application](#web-application)
- [Limitations](#limitations)
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
  -p, --propagate    add propagatable slots to mappings
  -c, --curie FILE   additional CURIE map (JSON or YAML file)
  -e, --empty        allow empty mappings block in SSSOM/TSV
  -m, --mappings     emit mappings only
  -v, --verbose      verbose error messages
  -x, --errors       emit errors in JSON
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

If you want to allow all CURIE prefixes from [Bioregistry](https://bioregistry.io) without explicitly defining them in `curie_map` you can download and convert the current list for instance with command line tools `curl` and `jq` this way (requires local copy of file [bioregistry.jq](bioregistry.jq)) and then reference result file `bioregistry.json` with option `--curie`:

~~~
curl -sL https://w3id.org/biopragmatics/bioregistry.epm.json | \
jq -Sf bioregistry.jq > bioregistry.json
~~~

### API

~~~js
import { parseSSSOM, TSVReader, toJskosRegistry, toJskosMapping } from "sssom-js"
~~~

#### parseSSSOM (input, options)

This asynchronous function parses SSSOM in format `options.from` (`json`, or `tsv` as default) from a stream or file and returns a mapping set on success. The result should directly be serializable as SSSOM/JSON (or to JSKOS with option `to` set to `jskos`).

~~~js
import { parseSSSOM } from "sssom-js"
const { mappings, ...metadata } = await parseSSSOM(process.stdin)
~~~

An untruthy `input` value will skip processing of mappings so only the mapping set is returned:

~~~js
const metadata = await parseSSSOM(false, { metadata: "metadata.sssom.yaml" })
~~~

##### Options

- **from** (string, `tsv` by default): input format
- **to** (string): response format (`sssom` by default or `jskos`)
- **metadata** (string or object): mapping set metadata (external metadata mode) or file to read from
- **curie** (string or object) additional CURIE map or file to read from
- **propagation** (boolean, false by default): enables [propagation of mapping set slots](https://mapping-commons.github.io/sssom/spec-model/#propagation-of-mapping-set-slots)
- **empty** (boolean, false by default): allow empty mappings block in SSSOM/TSV (but still read and validate the metadata block)
- **metadataHandler** (function) called for parsed metadata
- **mappingHandler** (function) called for each parsed mapping

#### parseSSSOMString (input, options)

This is a utility function to parse SSSOM from a string. Equivalent implementation in NodeJS:

~~~js
parseSSSOMString = (input, options={}) => parseSSSOM(Readable.from(input), options)
~~~

#### TSVReader

This event emitter parses [SSSOM/TSV] from a stream and emits `metadata` and `mapping` events:

~~~js
import fs from "fs"
import { TSVReader } from "sssom-js"

const input = fs.createReadStream("test/valid/minimal.sssom.tsv")
new TSVReader(input)
  .on("metadata", console.log)
  .on("mapping", console.log)
  .on("error", console.error)
  .on("end", console.log)
~~~

#### toJskosRegistry

Convert a parsed MappingSet to a [JSKOS Registry](https://gbv.github.io/jskos/#registries) object.

#### toJskosMapping

Convert a parsed Mapping to a [JSKOS Concept Mapping](https://gbv.github.io/jskos/#concept-mapping) object.

## Validation errors

Validation error objects (emitted as JSON objects with command line option `-x, --errors`) habe three fields:

- `message` an error message
- `value` an optional value that caused the error
- `position` an optional object mapping locator formats to error locations. The following locator formats can be found:
  - `line`: a line number (given as string)
  - `jsonpointer`: a [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) to the malformed YAML or JSON element

## Web application

A web form to validate and transform SSSOM/TSV is made available at <https://gbv.github.io/sssom-js/>. This application is not included in the package release at npm.

## Limitations

- [SSSOM/JSON] has not officially been specified yet, so the format used by this package may change
- Validation of CURIEs may be limited for some edge cases (see [issue #15](https://github.com/gbv/sssom-js/issues/15)) 
- [Literal Mappings](https://mapping-commons.github.io/sssom/spec-model/#literal-mappings) are not supported
- [Non-standard slots](https://mapping-commons.github.io/sssom/spec-model/#non-standard-slots) are not supported and its mapping set slot `extension_definition` is ignored

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
