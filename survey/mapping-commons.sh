#!/usr/bin/bash
set -euo pipefail

mkdir -p mapping-commons
cd mapping-commons

if [[ ${1:-} = "download" ]]
then
  wget -nc https://github.com/mapping-commons/mapping-commons.github.io/raw/refs/heads/main/data/mapping-data.json
  jq -r .registries[].mapping_sets[].mapping_set_id mapping-data.json | xargs -L1 wget
fi

validate() {
    echo -e "file\tmappings\terror"
    for sssom in *.tsv; do
        jskos=${sssom%.html}.ndjson
        error=$((../../bin/sssom.js -t jskos -o "$jskos" $sssom || rm -f "$jskos") 2>&1)
        mappings=0
        [[ -f "$jskos" ]] && mappings=$(jq '.mappings|length' "$jskos" | tr -d '\n')
        echo -n "$sssom"
        echo -ne "\t$mappings\t"
        echo "$error"
    done
}

validate | tee ../mapping-commons.tsv
