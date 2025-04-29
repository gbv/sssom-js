export const mappingTypes = {
  "http://www.w3.org/2004/02/skos/core#mappingRelation": "http://www.w3.org/2004/02/skos/core#mappingRelation",
  "http://www.w3.org/2004/02/skos/core#closeMatch": "http://www.w3.org/2004/02/skos/core#closeMatch",
  "http://www.w3.org/2004/02/skos/core#exactMatch": "http://www.w3.org/2004/02/skos/core#exactMatch",
  "http://www.w3.org/2004/02/skos/core#broadMatch": "http://www.w3.org/2004/02/skos/core#broadMatch",
  "http://www.w3.org/2004/02/skos/core#narrowMatch": "http://www.w3.org/2004/02/skos/core#narrowMatch",
  "http://www.w3.org/2004/02/skos/core#relatedMatch": "http://www.w3.org/2004/02/skos/core#relatedMatch",
  "http://www.w3.org/2002/07/owl#sameAs": "http://www.w3.org/2004/02/skos/core#exactMatch",
  "http://www.w3.org/2002/07/owl#equivalentClass": "http://www.w3.org/2004/02/skos/core#exactMatch",
  "http://www.w3.org/2002/07/owl#equivalentProperty": "http://www.w3.org/2004/02/skos/core#exactMatch",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#subClassOf": "http://www.w3.org/2004/02/skos/core#narrowMatch",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#subPropertyOf": "http://www.w3.org/2004/02/skos/core#narrowMatch",
  "http://www.geneontology.org/formats/oboInOwl#hasDbXref": "http://www.w3.org/2004/02/skos/core#relatedMatch",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#seeAlso": "http://www.w3.org/2004/02/skos/core#relatedMatch",
}

export const predicate2mappingTypes = uri => uri in mappingTypes
  ? [mappingTypes[uri]] : ["http://www.w3.org/2004/02/skos/core#mappingRelation", uri]

export function jskosItem(uri, und) {
  const item = uri ? { uri } : {}
  if (und) {
    item.prefLabel = { und } // und = undefined language
  }
  return item
}

export const toJskosMapping = mapping => {
  const { predicate_id, subject_id, subject_label, object_id, object_label, mapping_justification } = mapping
  const from = [], to = []

  // TODO: subject_type, subject_source, subject_source_version
  if (subject_id && subject_id !== "https://w3id.org/sssom/NoTermFound") {
    from[0] = jskosItem(subject_id, subject_label)
  }

  // TODO: object_type, object_source, object_source_version
  if (object_id && object_id !== "https://w3id.org/sssom/NoTermFound") {
    to[0] = jskosItem(object_id, object_label)
  }

  const jskos = {
    type: predicate2mappingTypes(predicate_id),
    from: { memberSet: from },
    to: { memberSet: to },
    justification: mapping_justification, // JSKOS 0.7.0
  }

  // TODO: mapping_provider, mapping_source, mapping_tool
  // TODO: mapping_date, publication_date
  // TODO: curation_rule, curation_rule_text
  // TODO: issue_tracker_item, comment

  if ("confidence" in mapping) {
    jskos.mappingRelevance = mapping.confidence
  }

  if ("comment" in mapping) {
    jskos.note = { und: [mapping.comment] }
  }

  const author_id = mapping.author_id || []
  const author_label = mapping.author_label || []
  if (author_id.length + author_label.length) {
    jskos.creator = []
    for (let i=0; i<Math.max(author_id.length, author_label.length); i++) {
      jskos.creator.push( jskosItem(author_id[i], author_label[i]))
    }
  }

  return jskos
}

export const toJskosRegistry = set => {
  const { license, mapping_set_id } = set

  const jskos = { uri: mapping_set_id, license: [ { uri: license } ]}

  // TODO: map more mappingSet properties

  if (set.mappings) {
    jskos.mappings = set.mappings.map(toJskosMapping)
  }

  return jskos
}
