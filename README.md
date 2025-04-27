# sssom-js

[![Test](https://github.com/gbv/sssom-js/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/sssom-js/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/sssom-js.svg?style=flat)](https://www.npmjs.org/package/sssom-js)

> Simple Standard for Sharing Ontology Mappings (SSOM) JavaScript library

This Node package provides methods and a command line client to process mappings in [SSSOM] format.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Publish](#publish)
- [Contribute](#contribute)
- [License](#license)

## Install 

```bash
npm install sssom-js
```

Requires Node.js >= 20.

## Usage

See [API](#api) for usage as a library. The package includes the command line client `sssom`. Please call `sssom --help` for usage.

## API

The package exports the following:

### TSVReader

This event emitter parses [SSSOM/TSV] from a stream and emits `metadata` and `mapping` events.

### parseSSSOM (input, options)

This function parses SSSOM in format `options.from` (default `tsv`) from a stream or file and returns a mapping set. The result should directly be serializable as SSSOM/JSON.

### parseTSV (input, options)

This function parses [SSSOM/TSV] from a stream or file and returns a mapping set. The result should directly be serializable as SSSOM/JSON.

## Maintainers

- [@nichtich](https://github.com/nichtich) (Jakob Voß)

## Contribute

Contributions are welcome! Best use [the issue tracker](https://github.com/gbv/sssom-js/issues) for questions, bug reports, and/or feature requests!

## License

MIT license

[SSSOM]: https://mapping-commons.github.io/sssom/
[SSSOM/TSV]: https://mapping-commons.github.io/sssom/spec-formats-tsv/
