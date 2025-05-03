map(
  .uri_prefix as $value |
  .prefix, 
  ( .uri_prefix_synonyms//[] | map(rtrimstr(":")|select(contains(":")|not)) )[]
  |{key:.,$value} 
) | from_entries

