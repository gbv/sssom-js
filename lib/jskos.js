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
  const item = { uri }
  if (und) {
    item.prefLabel = { und } // und = undefined language
  }
  return item
}

export const mapping2jskos = mapping => {
  const { predicate_id, subject_id, subject_label, object_id, object_label, author_id, mapping_justification } = mapping
  const from = []
  const to = []
  if (subject_id) {
    from[0] = jskosItem(subject_id, subject_label)
  }
  if (object_id) {
    to[0] = jskosItem(object_id, object_label)
  }

  const jskos = {
    type: predicate2mappingTypes(predicate_id),
    from: { memberSet: from },
    to: { memberSet: to },
    justification: mapping_justification, // JSKOS 0.7.0
  }
  if ("confidence" in mapping) {
    jskos.mappingRelevance = mapping.confidence
  }
  if ("comment" in mapping) {
    jskos.note = { und: [mapping.comment] }
  }
  if (author_id) { // TODO: support author_label without author_id?
    const author_label = mapping.author_label || []
    jskos.creator = []
    for (let i=0; i<author_id.length; i++) {
      jskos.creator.push( jskosItem(author_id[i], author_label[i]))
    }
  }

  return jskos
}

export const set2jskos = set => {
  const jskos = {}
  // TODO: map mappingSet properties
  if (set.mappings) {
    jskos.mappings = set.mappings.map(mapping2jskos)
  }
  return jskos
}
