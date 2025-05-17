# Survery of published SSSOM/TSV data

A list of published mappings in SSSOM/TSV format is managed in file [sources.tsv](sources.tsv) with columns:

- `url` - DOI (preferred, use [all-versions DOI](https://zenodo.org/help/versioning) if available) or landing page URL of the data publication
- `download` - deep link to directly download the file
- `file` - filename (relevant to detect serialization format, by now `.tsv` and `.tsv.gz` are supported)

Their files are downloaded and validated with a Bash script and the result is written into file [result.csv](result.csv):

~~~sh
./survey.sh > result.csv
~~~

## TODO

- Some data sets need to be downloaded manually, otherwise they are marked as "MISSING"
- Support external metadata mode by adding another `metadata` column to the sources file
