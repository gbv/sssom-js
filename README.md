# sssom-js

[![Test](https://github.com/gbv/sssom-js/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/sssom-js/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/sssom-js.svg?style=flat)](https://www.npmjs.org/package/sssom-js)

> Simple Standard for Sharing Ontology Mappings (SSOM) JavaScript library

This Node package provides methods and a command line client to process mappings in [SSSOM] format.

It implements parsing variants of SSSOM (TSV, CSV and JSON) with validation and transformation to multiple [formats](#formats), including [JSKOS] and RDF.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Command line](#command-line)  
  - [Web interface](#web-interface)
  - [API](#api)  
- [Options](#options)
- [Validation errors](#validation-errors)
- [Formats](#formats)
  - [RDF](#rdf)
  - [JSKOS](#jskos)
- [Limitations](#limitations)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install 

Requires Node.js >= 20.19.

```bash
npm install sssom-js
```

For RDF export in the command line client also install [jsonld2rdf].

```
npm install jsonld2rdf
```

The [web interface](#web-interface) can be deployed on any web server by copying static files from directory [docs](https://github.com/gbv/sssom-js/tree/main/docs) of the source code repository.

## Usage

### Command line

The package includes a command line client to parse and convert SSSOM. Usage and options:

~~~
sssom [options] [<mappings-file> [<metadata-file>]] 
~~~

short| long             | argument | description
-----|------------------|----------|-------------
`-f` | `--from`         | format   | input [format](#formats) (`csv`, `tsv`, `json`)
`-t` | `--to`           | format   | output [format](#formats) (`json`, `ndjson`, `jskos`, `ndjskos`, `nq`, `nt`, `ttl`)
`-o` | `--output`       | file     | output filename or default `-` for stdout
`-p` | `--propagate`    |          | [add propagatable slots](#propagate) to mappings
`-b` | `--liberal`      |          | parse [less strict](#liberal) than the specification
`-c` | `--curie`        | file     | additional [CURIE map](#curie) (JSON or YAML file)
`-s` | `--schemes`      | file     | JSKOS concept [schemes](#schemes) to detect
`-m` | `--mappings`     |          | emit [mappings only](#mappings)
`-v` | `--verbose`      |          | emit error verbosely
`-j` | `--json-errors`  |          | emit errors in JSON ([Data Validation Error Format])
`-h` | `--help`         |          | emit usage information
`-V` | `--version`      |          | emit the version number

### Web interface

A web interface to validate and transform SSSOM/TSV is made available at <https://gbv.github.io/sssom-js/>. The application is not included in the package release at npm.

### API

~~~js
import { parseSSSOM, TSVReader, toJskosRegistry, toJskosMapping } from "sssom-js"
~~~

#### parseSSSOM (input, options)

This asynchronous function parses SSSOM in an [input format](#formats) from a stream or file and returns a mapping set on success. The result should directly be serializable as SSSOM/JSON (or as JSKOS with option `to` set to `jskos`).

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

A second optional argument can be used to pass options [`propagate`](#propagate) (boolean), [`liberal`](#liberal) (boolean), `delimiter` (string), [`curie`](#curie) (object), [metadata](#metadata) (object), and `storeMappings` (boolean). The latter makes mappings to be collected and returned with the result at the end of parsing. 

#### toJskosRegistry

Convert a parsed MappingSet to a [JSKOS Registry](https://gbv.github.io/jskos/#registries) object.

#### toJskosMapping

Convert a parsed Mapping to a [JSKOS Concept Mapping](https://gbv.github.io/jskos/#concept-mapping) object.

## Options

The following options are supported by both the [command line client](#command-line), and the [API](#api):

### propagate

Enables [propagation of mapping set slots](https://mapping-commons.github.io/sssom/spec-model/#propagation-of-mapping-set-slots). False by default.

### liberal

Enabling liberal parsing will

- allow empty mappings block in SSSOM/TSV (but still read and validate the metadata block)
- not require mapping set slots (neither `mapping_set_id` nor `license`) so the metadata block can be empty
- not require mapping slot `mapping_justification`

### curie

If you want to allow all CURIE prefixes from [Bioregistry](https://bioregistry.io) without explicitly defining them in `curie_map` you can download and convert the current list for instance with command line tools `curl` and `jq` this way (requires local copy of file [bioregistry.jq](bioregistry.jq)) and then reference result file `bioregistry.json` with option `--curie`:

~~~
curl -sL https://w3id.org/biopragmatics/bioregistry.epm.json | \
jq -Sf bioregistry.jq > bioregistry.json
~~~

### schemes

JSKOS Concept Schemes to detect when transforming to JSKOS

### mappings

Emit mappings only. Metadata is parsed and validated nevertheless.

### metadata

Mapping set metadata file in JSON or YAML format for external metadata mode. Is passed as second argument in the command line client or as named option in the API. The API also accepts a parsed object.

## Validation errors

[Data Validation Error Format]: https://gbv.github.io/validation-error-format/

Validation errors follow the [Data Validation Error Format] in condense form. Each error is an object with three fields:

- `message` an error message
- `value` an optional value that caused the error
- `position` an optional object mapping locator types to error locations. The following locator types are used:
  - `line`: a line number given as string, starting with `1` for the first line
  - `linecol`: line a column number (both starting with `1`), separated by `:`
  - `rfc5147`: line span conforming to [RFC 5147](http://tools.ietf.org/html/rfc5147), for instance `line=2,4` for line 3 (!) to 4
  - `jsonpointer`: [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) to the malformed YAML or JSON element (for instance `/creator_id`)

## Formats

Input format and output format can be specified via [command line options](#command-line) `from` and `to`, and in the [web interface](#web-interface). 

of the mappings, given as string. The following formats are supported so far:

format   | description   | from | to | API
---------|---------------|------|----|-----
`tsv`    | [SSSOM/TSV]   | yes  | -  | yes
`csv`    | SSSOM/CSV     | yes  | -  | yes
`json`   | [SSSOM/JSON]/JSON-LD | yes | yes | yes
`ndjson` | metadata and mappings on individual lines (SSSOM/JSON) | to | -
`jskos`  | [JSKOS]       | -    | to | yes |
`ndjskos`| metadata and mappings on individual lines (JSKOS) | to | -
`nq`     | [NQuads] ([RDF]) of raw mappings | - | to | -
`nt`     | [NTriples] ([RDF])               | - | to (requires [jsonld2rdf]) | -
`ttl`    | [RDF/Turtle] ([RDF])             | - | to (requires [jsonld2rdf]) | -

[RDF]: #rdf
[NQuads]: https://www.w3.org/TR/n-quads/
[NTriples]: https://www.w3.org/TR/n-triples/
[RDF/Turtle]: https://www.w3.org/TR/turtle/

If not specified, formats are guessed from file name with fallback to `tsv` (from) and `ndjson` (to).

Formats `json`, `jskos`, `nt`, and `ttl` require to fully load the input into memory for processing, the other formats support streaming processing.

NQuads format (`nq`) is limited to the raw mapping statements without metadata and additional slots except `subject_id`, `predicate_id`, `object_id`, and optional `mapping_set_id`. Combine with option `-m, --mappings` to omit the latter, resulting in NTriples format of raw mappings.

### RDF

RDF serialisation of SSSOM has not fully been specified yet. This package uses [a JSON-LD context](context.json) to transform SSSOM/JSON to SSSOM/RDF, except for NQuad (`nq`) output format that only consists of one triple per mapping.

The following slots are not included because semantics are not clear (yet) or because their content better belongs to another place:

- [other]
- [mapping_tool], [mapping_tool_id] and [mapping_tool_version]
- [subject_label], [subject_source], [subject_source_version], [subject_type], [object_source], [object_source_version], [object_type], [predicate_label]
- [predicate_type], [object_category]
- [object_match_field], [object_preprocessing], [subject_match_field], [subject_preprocessing], [similarity_measure], [match_string], [similarity_score] - see [this discussion](https://github.com/gbv/jskos/issues/152)
- [extension_definitions]
- [predicate_modifier]
- [mapping_cardinality]

The following slots will likely be included once a good existing predicate URI has been found:

- [mapping_source]
- [confidence]
- [issue_tracker], [issue_tracker_item]

### JSKOS

The [JSKOS data format](https://gbv.github.io/jskos/) is used in terminology applications for controlled vocabularies and their mappings. 

The following correspondence between SSSOM and JSKOS has not fully been implemented yet.
Some JSKOS fields will only be available since version 0.7.0 of JSKOS specification.

#### Common slots

SSSOM slot | JSKOS field
------------|------------
[comment] | `note.und[]`
[creator_id] | `contributor[].uri`
[creator_label] | `contributor[].prefLabel.und`
[publication_date] | `published`
[see_also] | ?
[other] | -

#### Propagatable slots

SSSOM slot | JSKOS field
-----------|------------
[mapping_date] | `created`
[mapping_provider] |`publisher[].url`
[mapping_tool] | `tool[].url`\* (0.7.0)
[mapping_tool_id] | `tool[].uri`\* (0.7.0)
[mapping_tool_version] | `tool[].version`\* (0.7.0)
[object_source] | `to.memberSet[].inScheme[].uri`
[object_source_version] | `to.memberSet[].inScheme[].version` (0.7.0)
[object_type] | `from.memberSet[].type` (URI, limited list)
[subject_source] | `from.memberSet[].inScheme`
[subject_source_version] | `from.memberSet[].inScheme[].version` (0.7.0)
[subject_type] | `from.memberSet[].type` (URI, limited list)
[predicate_type] | -
[object_match_field] | - (see [this discussion](https://github.com/gbv/jskos/issues/152))
[object_preprocessing] | - (dito)
[subject_match_field] | - (dito)
[subject_preprocessing] | - (dito)
[similarity_measure] | - (dito)

\* The correspondence of slots `mapping_tool` , `mapping_tool_id`, and `mapping_tool_version` is slightly more complicated.

#### Mapping set slots

SSSOM slot | JSKOS field
-----------|------------
[curie_map] | -
[license] | `license.uri`
[mappings] | `mappings` (of a registry or concordance)
[mapping_set_id] | `uri`
[mapping_set_version] | `version` (0.7.0)
[mapping_set_source] | `source`
[mapping_set_title] | `prefLabel.und`
[mapping_set_description] | `definition`
[issue_tracker] | `issueTracker` (0.7.0)
[predicate_label] | -
[extension_definitions] | -

#### Mapping slots

SSSOM slot | JSKOS field
------------|------------
mapping_id | uri
[subject_id] | `from.memberSet[].uri`
[subject_label] | `from.memberSet[].prefLabel`
[subject_category] | -
[predicate_id] | `type`
[predicate_label] | - (implied by `type`)
[object_id] | `to.memberSet[].uri`
[object_label] | `to.memberSet[].prefLabel`
[object_category] | -
[mapping_justification] | `justification` (0.7.0)
[author_id] | `creator[].uri`
[author_label] | `creator[].prefLabel`
[reviewer_id] | `annotations[].creator.id`
[reviewer_label] | `annotations[].creator.name`
[mapping_source] | `source`
[confidence] | `mappingRelevance`
[curation_rule] | `guidelines` (0.7.0)
[curation_rule_text] | `guidelines[].prefLabel` (0.7.0)
[issue_tracker_item] | `issue` (0.7.0)
[license] | - (only for mapping sets)
[predicate_modifier] | -
[mapping_cardinality] | -
[match_string] | - (see [this discussion](https://github.com/gbv/jskos/issues/152))
[similarity_score] | - (dito)

[comment]: https://w3id.org/sssom/comment
[creator_id]: https://w3id.org/sssom/creator_id
[creator_label]: https://w3id.org/sssom/creator_label
[publication_date]: https://w3id.org/sssom/publication_date
[see_also]: https://w3id.org/sssom/see_also
[other]: https://w3id.org/sssom/other
[mapping_date]: https://w3id.org/sssom/mapping_date
[mapping_provider]: https://w3id.org/sssom/mapping_provider
[mapping_tool]: https://w3id.org/sssom/mapping_tool
[mapping_tool_id]: https://w3id.org/sssom/mapping_tool_id
[mapping_tool_version]: https://w3id.org/sssom/mapping_tool_version
[object_source]: https://w3id.org/sssom/object_source
[object_source_version]: https://w3id.org/sssom/object_source_version
[object_type]: https://w3id.org/sssom/object_type
[subject_source]: https://w3id.org/sssom/subject_source
[subject_source_version]: https://w3id.org/sssom/subject_source_version
[subject_type]: https://w3id.org/sssom/subject_type
[predicate_type]: https://w3id.org/sssom/predicate_type
[object_match_field]: https://w3id.org/sssom/object_match_field
[object_preprocessing]: https://w3id.org/sssom/object_preprocessing
[subject_match_field]: https://w3id.org/sssom/subject_match_field
[subject_preprocessing]: https://w3id.org/sssom/subject_preprocessing
[similarity_measure]: https://w3id.org/sssom/similarity_measure
[curie_map]: https://w3id.org/sssom/curie_map
[license]: https://w3id.org/sssom/license
[mappings]: https://w3id.org/sssom/mappings
[mapping_set_id]: https://w3id.org/sssom/mapping_set_id
[mapping_set_version]: https://w3id.org/sssom/mapping_version
[mapping_set_source]: https://w3id.org/sssom/mapping_source
[mapping_set_title]: https://w3id.org/sssom/mapping_title
[mapping_set_description]: https://w3id.org/sssom/mapping_description
[issue_tracker]: https://w3id.org/sssom/issue_tracker
[predicate_label]: https://w3id.org/sssom/predicate_label
[extension_definitions]: https://w3id.org/sssom/extension_definitions/
[subject_id]: https://w3id.org/sssom/subject_id
[subject_label]: https://w3id.org/sssom/subject_label
[subject_category]: https://w3id.org/sssom/subject_category
[predicate_id]: https://w3id.org/sssom/predicate_id
[predicate_label]: https://w3id.org/sssom/predicate_label
[object_id]: https://w3id.org/sssom/object_id
[object_label]: https://w3id.org/sssom/object_label
[object_category]: https://w3id.org/sssom/object_category
[mapping_justification]: https://w3id.org/sssom/mapping_justification
[author_id]: https://w3id.org/sssom/author_id
[author_label]: https://w3id.org/sssom/author_label
[reviewer_id]: https://w3id.org/sssom/reviewer_id
[reviewer_label]: https://w3id.org/sssom/reviewer_label
[mapping_source]: https://w3id.org/sssom/mapping_source
[confidence]: https://w3id.org/sssom/confidence
[curation_rule]: https://w3id.org/sssom/curation_rule/
[curation_rule_text]: https://w3id.org/sssom/curation_rule_text/
[issue_tracker_item]: https://w3id.org/sssom/issue_tracker_item
[license]: https://w3id.org/sssom/license
[predicate_modifier]: https://w3id.org/sssom/predicate_modifier
[mapping_cardinality]: https://w3id.org/sssom/mapping_cardinality
[match_string]: https://w3id.org/sssom/match_string
[similarity_score]: https://w3id.org/sssom/similarity_score

## Limitations

This library follows the [SSSOM specification](https://mapping-commons.github.io/sssom/spec-intro/) as close as possible, but it does not aim to be a fully compliant implementation. The latter would require to also comply to [LinkML](https://w3id.org/linkml/specification), a specification much more complex then needed for SSSOM and not fully been implemented in JavaScript yet. In particular:

- All slots of [type Uri](https://mapping-commons.github.io/sssom/Uri/) must be **absolute** URIs as defined in [RFC 3986](http://tools.ietf.org/html/rfc3986)
- [Literal Mappings](https://mapping-commons.github.io/sssom/spec-model/#literal-mappings) are not supported
- [Non-standard slots](https://mapping-commons.github.io/sssom/spec-model/#non-standard-slots) are not supported:
  - mapping set slot `extension_definition` is ignored
  - mapping set slot `other` is read and validated but not used
- [SSSOM/JSON], the JSON serialization of SSSOM has not been specified yet, so it may differ from the JSON(-LD) format used in this library. Some applies to the RDF serialization.
- Propagation silently overwrites existing mapping slots instead of raising an error
- Uniqueness of mapping slot `mapping_id` is not checked.

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
[jsonld2rdf]: https://www.npmjs.com/package/jsonld2rdf

