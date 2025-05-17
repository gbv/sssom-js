# Survery of published SSSOM/TSV data

A list of published mappings in SSSOM/TSV format is managed in file [sources.tsv](sources.tsv).

Their files are downloaded and validated with a Bash script and the result is written into file [result.csv](result.csv):

~~~sh
./survey.sh > result.csv
~~~

TODO: Some data sets need to be downloaded manually, otherwise they are marked as "MISSING"
