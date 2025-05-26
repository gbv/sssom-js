import { Namespaces } from "namespace-lookup"

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

export function jskosItem(uri, und, scheme) {
  const item = uri ? { uri } : {}
  if (und) {
    item.prefLabel = { und } // und = undefined language
  }
  if (scheme) {
    item.inScheme = [ scheme ]
  }
  return item
}

const map = {
  // mapping
    
  // both
  comment: ["note", note => ({ und: [note]})],
  license: ["license", uri => [ { uri } ]], // FIXME: only for mapping set!!!!
  // TODO: subject_type, subject_source, subject_source_version, object_type, object_source, object_source_version
  predicate_type: null,
  predicate_label: null,
  mapping_provider: ["publisher", url => [{url}]], // TODO: uri or url?
  mapping_tool: null, // TODO
  mapping_tool_version: null, // TODO

  mapping_date: ["created"],
  publication_date: ["published"],
  mapping_source: ["source", uri => [{uri}]],
  issue_tracker_item: ["issue", uri => [{uri}]], // JSKOS 0.7.0
  confidence: ["mappingRelevance"],   

  mapping_justification: ["justification"], // JSKOS 0.7.0
  other: null,

  // mapping set
  // TODO: sssom_version
  mapping_set_id: ["uri"],
  mapping_set_version: ["versionId"], // JSKOS 0.7.0
  mapping_set_source: ["source", uri => [{uri}]],
  mapping_set_title: ["prefLabel", und => ({und})],
  mapping_set_description: ["definition", und => ({und:[und]})],
  issue_tracker: ["issueTracker", uri => [{uri}]], // JSKOS 0.7.0
}

function mapSlots(sssom, jskos={}) {
  // TODO: don't mix mapping and mappingSet slots

  Object.entries(map).filter(([_,def])=>def).forEach(([slot, [key, transform]]) => {
    if (sssom[slot]) {
      jskos[key] = transform ? transform(sssom[slot]) : sssom[slot]
    }
  })

  // TODO: mapping_tool and mapping_tool_version => tool (JSKOS 0.7.0)
  // TODO: curation_rule, curation_rule_text => guidelines (JSKOS 0.7.0)

  // combine creator and author
  const creator_id = sssom.author_id || sssom.creator_id || []
  const creator_label = (sssom.author_id ? sssom.author_label : sssom.creator_label) || []
  if (creator_id.length + creator_label.length) {
    jskos.creator = []
    for (let i=0; i<Math.max(creator_id.length, creator_label.length); i++) {
      jskos.creator.push( jskosItem(creator_id[i], creator_label[i]))
    }
  }

  return jskos
}

const schemes2namespaces = schemes => {
  if (schemes instanceof Namespaces) {
    return schemes
  } else {
    const prefixes = schemes
      .map(({uri, namespace}) => uri && namespace ? [ namespace, uri ] : false)
      .filter(Boolean)
    return new Namespaces(Object.fromEntries(prefixes))
  }
}

const jskosScheme = (uri, version) => uri ? (version ? { uri, version } : { uri } ) : null

// TODO: document options
export const toJskosMapping = (mapping, { schemes, namespaces } = {}) => {
  const { predicate_id, subject_id, subject_label, object_id, object_label } = mapping
  const from = [], to = []

  // TODO: subject_type
  if (subject_id && subject_id !== "https://w3id.org/sssom/NoTermFound") {
    const scheme = jskosScheme(mapping.subject_source, mapping.subject_source_version)
    from[0] = jskosItem(subject_id, subject_label, scheme)
  }

  // TODO: object_type
  if (object_id && object_id !== "https://w3id.org/sssom/NoTermFound") {
    const scheme = jskosScheme(mapping.subject_source, mapping.object_source_version)
    to[0] = jskosItem(object_id, object_label, scheme)
  }

  // TODO: move to SSSOM parser to populate subject_source and object_source

  if (schemes && !namespaces) {
    namespaces = schemes2namespaces(schemes)
  }

  if (namespaces) {
    for (let item of [...from, ...to]) {
      if (!item.inScheme) {
        const uri = namespaces.lookup(item.uri)
        if (uri) {
          item.inScheme = [{uri}]
        }
      } // TODO: else: check if scheme is known?
    }
  }

  const jskos = {
    type: predicate2mappingTypes(predicate_id),
    from: { memberSet: from },
    to: { memberSet: to },
  }

  mapSlots(mapping, jskos)
  
  return jskos
}

export const toJskosRegistry = (sssom, { schemes } = {}) => {
  const jskos = mapSlots(sssom)

  if (sssom.mappings) {
    const namespaces = schemes ? schemes2namespaces(schemes) : null
    jskos.mappings = sssom.mappings.map(m => toJskosMapping(m, { namespaces }))
  }

  return jskos
}

export const sssomOrJskos = (sssom, { to, schemes }) =>  {
  if (!sssom || to !== "jskos") {
    return sssom
  }
  return toJskosRegistry(sssom, { schemes })
}
