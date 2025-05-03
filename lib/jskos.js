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

const map = {
  mapping_set_id: ["uri"],
  //  mapping_set_version: ["versionId"], // TODO
  mapping_set_source: ["source", uri => [{uri}]],
  mapping_set_title: ["prefLabel", und => ({und})],
  // TODO: mapping_set_description
  // TODO: predicate_type
  // TODO: issue_tracker // JSKOS 0.7.0

  mapping_provider: ["publisher", url => [{url}]], // TODO: uri or url?
  mapping_source: ["source", uri => [{uri}]],
  mapping_date: ["created"],
  publication_date: ["published"],
  issue_tracker_item: ["issue", uri => [{uri}]], // JSKOS 0.7.0
  comment: ["note", note => ({ und: [note]})],
  confidence: ["mappingRelevance"],   

  license: ["license", uri => [ { uri } ]],
  mapping_justification: ["justification"], // JSKOS 0.7.0

// extension_definitions is ignored
}

function mapSlots(sssom, jskos={}) {
  // TODO: don't mix mapping and mappingSet slots

  Object.entries(map).forEach(([slot, [key, transform]]) => {
    if (sssom[slot]) {
      jskos[key] = transform ? transform(sssom[slot]) : sssom[slot]
    }
  })

  // TODO: mapping_tool and mapping_tool_version => tool (JSKOS 0.7.0)

  // TODO: curation_rule, curation_rule_text => guidelines (JSKOS 0.7.0)

  return jskos
}


export const toJskosMapping = mapping => {
  const { predicate_id, subject_id, subject_label, object_id, object_label } = mapping
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
  }

  mapSlots(mapping, jskos)

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

export const toJskosRegistry = sssom => {
  const jskos = mapSlots(sssom)

  if (sssom.mappings) {
    jskos.mappings = sssom.mappings.map(toJskosMapping)
  }

  return jskos
}
