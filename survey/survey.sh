#!/usr/bin/bash

echo n,url,status,message

while IFS=$'\t' read -r url download file
do ((i++)) || continue  # skip header
    ((n++))
    [[ "${1:-n}" -ne $n ]] && continue  # selected source only

    mkdir -p $n
    file="$n/$file"

    echo -n "$n,$url,"
    if [[ ! -s "$file" || "${1:-}" -eq $n ]]; then
        curl "$download" 2>/dev/null > "$file" || {
            echo "MISSING,"
            continue
        }
    fi

    validate() {
        ../bin/sssom.js -t ndjson -x "$file" > "$n/mappings.ndjson" 2> $n/error.json
        if [[ $? ]]; then
            echo "INVALID,$(jq .message $n/error.json)"
            rm -f $n/mappings.ndjson
        else
            echo "OK,$(wc -l $n/mappings.ndjson)"
            rm -f $n/error.json
        fi
    }

    if [[ "$file" == *.gz ]]; then
        zcat "$file" | validate
    else
        validate
    fi
done < sources.tsv

