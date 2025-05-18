#!/usr/bin/bash

download=
if [[ "${1:-}" -eq "-f" ]]; then
  shift
  download=true
fi

echo n,url,status,message

while IFS=$'\t' read -r url download file metadata
do ((i++)) || continue  # skip header
    ((n++))
    [[ "${1:-n}" -ne $n ]] && continue  # selected source only

    mkdir -p $n
    file="$n/$file"

    echo -n "$n,$url,"
    if [[ "$download" != "-" ]]; then 
        if [[ ! -s "$file" || $download = true ]]; then
            curl -s "$download" > "$file"
        fi
    fi
    if [[ -n "$metadata" ]]; then
        if [[ ! -s "$n/metadata.yaml" || $download = true ]]; then
            curl -s "$metadata" > "$n/metadata.yml"
        fi
    fi
    
    [[ -s "$file" ]] || { echo "MISSING,"; continue; }
    if [[ -n "$metadata" ]]; then
        [[ -s "$n/metadata.yml" ]] || { echo "MISSING-METADATA,"; continue; }
    fi

    validate() {
        if [[ -s "$n/metadata.yml" ]]; then
            ../bin/sssom.js -t ndjson -x "$file" "$n/metadata.yml" > "$n/mappings.ndjson" 2> $n/error.json
        else
            ../bin/sssom.js -t ndjson -x "$file" > "$n/mappings.ndjson" 2> $n/error.json
        fi
    }

    if [[ "$file" == *.gz ]]; then
        zcat "$file" | validate
    else
        validate
    fi

    if [[ -s "$n/error.json" ]]; then
        echo "INVALID,$(jq .message $n/error.json | sed 's/\\"/""/g')"
        rm -f $n/mappings.ndjson
    else
        echo "OK,$(wc -l < $n/mappings.ndjson) mappings"
        rm -f $n/error.json
    fi

done < sources.tsv

