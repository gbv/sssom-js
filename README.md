# sssom-js

[![Test](https://github.com/gbv/sssom-js/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/sssom-js/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/sssom-js.svg?style=flat)](https://www.npmjs.org/package/sssom-js)

> Simple Standard for Sharing Ontology Mappings (SSOM) JavaScript library

This Node package provides methods and a command line client to process mappings in [SSSOM] format.

It implements parsing variants of SSSOM (TSV, CSV and JSON) with validation and transformation to other SSSOM serializations and to [JSKOS] format.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Command line](#command-line)
  - [API](#api)  
  - [Options](#options)
  - [Validation errors](#validation-errors)
  - [Web application](#web-application)
- [Limitations](#limitations)
- [Transformation to JSKOS](#transformation-to-jskos)
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
  -f, --from FORMAT   input format (csv, tsv, json)
  -t, --to FORMAT     output format (json, ndjson, jskos, ndjskos)
  -o, --output FILE   output file (default: - for stdout)
  -p, --propagate     add propagatable slots to mappings
  -c, --curie FILE    additional CURIE map (JSON or YAML file)
  -b, --liberal       parse less strict than the specification
  -s, --schemes FILE  JSKOS concept schemes to detect
  -m, --mappings      write mappings only
  -v, --verbose       emit error verbosely
  -j, --json-errors   emit errors detailled in JSON
  -h, --help          output usage information
  -V, --version       output the version number
~~~

See below for a more detailled description of [options](#options) common to the command line client and the internal API.

### API

~~~js
import { parseSSSOM, TSVReader, toJskosRegistry, toJskosMapping } from "sssom-js"
~~~

#### parseSSSOM (input, options)

This asynchronous function parses SSSOM in an [input format](#fromto) from a stream or file and returns a mapping set on success. The result should directly be serializable as SSSOM/JSON (or as JSKOS with option `to` set to `jskos`).

~~~js
import { parseSSSOM } from "sssom-js"
const { mappings, ...metadata } = await parseSSSOM(process.stdin)
~~~

An untruthy `input` value will skip processing of mappings so only the mapping set is returned:

~~~js
const metadata = await parseSSSOM(false, { metadata: "metadata.sssom.yaml" })
~~~

See below for a description of [common options](#options). Additional options are:

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

new TSVReader(input, { delimiter: "," }) // parse SSSOM/CSV
~~~

The following parsing options can be given with a second optional argument object:

- **metadata** (must be an object)
- **curie** (must be an object)
- **propagate** (boolean)
- **liberal** (boolean)
- **delimiter** (string)
- **storeMappings** (boolean) whether to store parsed mappings and include them in the result

#### toJskosRegistry

Convert a parsed MappingSet to a [JSKOS Registry](https://gbv.github.io/jskos/#registries) object.

#### toJskosMapping

Convert a parsed Mapping to a [JSKOS Concept Mapping](https://gbv.github.io/jskos/#concept-mapping) object.

### Options

- [from/to](#fromto)
- [metadata](#metadata)
- [propagate](#propagate) (boolean, false by default): 
- [curie](#curie)
- [liberal](#liberal)
- schemes
- mappings

#### from/to

Input format and output format of the mappings, given as string. The following formats are supported so far:

format   | description   | support
---------|---------------|---------
`tsv`    | [SSSOM/TSV]   | from
`csv`    | SSSOM/CSV     | from
`json`   | [SSSOM/JSON]  | from & to
`ndjson` | metadata and mappings on individual lines (SSSOM/JSON) | to
`jskos`  | [JSKOS]       | to
`ndjskos`| metadata and mappings on individual lines (JSKOS) | to 

If not specified, formats are guessed from file name with fallback to `tsv` (from) and `ndjson` (to).

Formats `json` and `jskos` require to fully load the input into memory for processing, the other formats support streaming processing.

#### metadata

Mapping set metadata file in JSON or YAML format for external metadata mode. Is passed as second argument in the command line client or as named option in the API. The API also accepts a parsed object.

#### liberal

Enabling liberal parsing will

- allow empty mappings block in SSSOM/TSV (but still read and validate the metadata block)
- not require mapping set slots (neither `mapping_set_id` nor `license`) so the metadata block can be empty
- not require mapping slot `mapping_justification`

#### curie

If you want to allow all CURIE prefixes from [Bioregistry](https://bioregistry.io) without explicitly defining them in `curie_map` you can download and convert the current list for instance with command line tools `curl` and `jq` this way (requires local copy of file [bioregistry.jq](bioregistry.jq)) and then reference result file `bioregistry.json` with option `--curie`:

~~~
curl -sL https://w3id.org/biopragmatics/bioregistry.epm.json | \
jq -Sf bioregistry.jq > bioregistry.json
~~~

#### propagate

Enables [propagation of mapping set slots](https://mapping-commons.github.io/sssom/spec-model/#propagation-of-mapping-set-slots).

### Validation errors

Validation error objects (emitted as JSON objects with command line option `-x, --errors`) have three fields:

- `message` an error message
- `value` an optional value that caused the error
- `position` an optional object mapping locator types to error locations. The following locator types are used:
  - `line`: a line number (given as string)
  - `jsonpointer`: a [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) to the malformed YAML or JSON element

### Web application

A web form to validate and transform SSSOM/TSV is made available at <https://gbv.github.io/sssom-js/>. This application is not included in the package release at npm.

## Limitations

This library follows the [SSSOM specification](https://mapping-commons.github.io/sssom/spec-intro/) as close as possible, but it does not aim to be a fully compliant implementation. The latter would require to also comply to [LinkML](https://w3id.org/linkml/specification), a specification much more complex then needed for SSSOM and not fully been implemented in JavaScript yet. In particular:

- All slots of [type Uri](https://mapping-commons.github.io/sssom/Uri/) must be absolute URIs as defined in [RFC 3986](http://tools.ietf.org/html/rfc3986)
- [Literal Mappings](https://mapping-commons.github.io/sssom/spec-model/#literal-mappings) are not supported
- [Non-standard slots](https://mapping-commons.github.io/sssom/spec-model/#non-standard-slots) are not supported (mapping set slot `extension_definition` is ignored)
- [SSSOM/JSON], the JSON serialization of SSSOM has not been specified yet, so it may differ from the JSON format used in this library

## Transformation to JSKOS

The transformation of SSSOM to JSKOS does not support the following mapping slots (yet):

- [`subject_category`](https://mapping-commons.github.io/sssom/subject_category/) and [`object_category`](https://mapping-commons.github.io/sssom/object_category/)
- [`predicate_type`](https://mapping-commons.github.io/sssom/predicate_type/), [`predicate_label`](https://w3id.org/sssom/predicate_label) and [`predicate_modifier`](https://w3id.org/sssom/predicate_modifier)
- [`reviewer_id`](https://w3id.org/sssom/reviewer_id) and [`reviewer_label`](https://w3id.org/sssom/reviewer_label)
- [`license`](https://w3id.org/sssom/license) as individual JSKOS mappings (in contrast to sets of mappings) have no license
- [`see_also`](https://w3id.org/sssom/see_also) and [`other`](https://w3id.org/sssom/other) having no clear semantics
- slots that carry information about automatic mapping algorithms (see [this issue](https://github.com/gbv/jskos/issues/152))

Slot `creator_id`/`creator_label` and `author_id`/`author_label` are merged into JSKOS field `creator`

## Survey

Directory [`survey`](survey) contains a survey of published SSSOM data with validation results. See [dev branch](https://github.com/gbv/sssom-js/tree/dev/survey) for most recent update.

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
