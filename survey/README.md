# Survery of published SSSOM/TSV data

A list of published mappings in SSSOM/TSV format is managed in file [sources.tsv](sources.tsv) with columns:

- `url` - DOI (preferred, use [all-versions DOI](https://zenodo.org/help/versioning) if available) or landing page URL of the data publication
- `download` - deep link to directly download the file
- `file` - filename (relevant to detect serialization format, by now `.tsv` and `.tsv.gz` are supported)

Their files are downloaded and validated with a Bash script and the result is written into file [result.csv](result.csv):

~~~sh
./survey.sh > result.csv
~~~

Some data sets need to be downloaded manually, otherwise they are marked as "MISSING":

- 8: https://doi.org/10.57745/ZLJYQO
- 23: https://doi.org/10.57745/ZLJYQO
- 25: https://doi.org/10.5281/zenodo.4323555

## Mapping Commons

[Mapping Commons](https://mapping-commons.github.io/) also pulls together mappings from various sources in SSSOM/TSV format. These mapping files are validated independently with this script:

~~~sh
./mapping-commons.sh
~~~

The result is written into file [mapping-commons.tsv](mapping-commons.tsv).
