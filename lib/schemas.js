// Minimal JSON Schemas of Mapping and MappingSet

export const $defs = {
  EntityReference: {        // only used in SSSOM/TSV
    type: "string", // TODO: further restrict
  },
  MappingJustification: {   // only used in SSSOM/TSV
    enum: [
      "semapv:LexicalMatching",
      "semapv:LogicalReasoning",
      "semapv:CompositeMatching",
      "semapv:UnspecifiedMatching",
      "semapv:SemanticSimilarityThresholdMatching",
      "semapv:LexicalSimilarityThresholdMatching",
      "semapv:MappingChaining",
      "semapv:MappingReview",
      "semapv:ManualMappingCuration",
    ],
  },
  EntityTypeEnum: {
    enum: [
      "owl class",
      "owl object property",
      "owl data property",
      "owl annotation property",
      "owl named individual",
      "skos concept",
      "rdfs resource",
      "rdfs class",
      "rdfs literal",
      "rdfs datatype",
      "rdf property",
      "composed entity expression",
    ],
  },
  Uri: {
    type: "string",
    format: "uri",
  },
  Date: {
    type: "string", // xsd:date
    regex: "^-?[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])(Z|[+-](0[0-9]|1[0-4]):([0-5][0-9]))?$",
  },
  Percentage: {
    type: "number",
    maximum: 1.0,
    minimum: 0.0,
  },
  PredicateModifier: {
    enum: [ "Not" ],
  },
  MappingCardinality: {
    enum: [ "1:1", "1:n", "n:1", "1:0", "0:1", "n:n" ],
  },
}

export const propagatableSlots = {
  mapping_date: { $ref: "#/$defs/Date" },
  mapping_provider: { $ref: "#/$defs/Uri" },
  mapping_tool: { type: "string" },
  mapping_tool_id: { $ref: "#/$defs/EntityReference" },
  mapping_tool_version: { type: "string" },
  object_match_field: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
  object_preprocessing: { type: "array", items: { $ref: "#/$defs/EntityReference"  } },
  object_source: { $ref: "#/$defs/EntityReference" },
  object_source_version: { type: "string" },
  object_type: { $ref: "#/$defs/EntityTypeEnum" },
  subject_match_field: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
  subject_preprocessing: { type: "array", items: { $ref: "#/$defs/EntityReference"  } },
  subject_source: { $ref: "#/$defs/EntityReference" },
  subject_source_version: { type: "string" },
  subject_type: { $ref: "#/$defs/EntityTypeEnum" },
  predicate_type: { $ref: "#/$defs/EntityTypeEnum" },
  similarity_measure: { type: "string" },
  curation_rule: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
  curation_rule_text: { type: "array", items: { type: "string" } },
}

const commonSlots = {
  comment: { type: "string" },
  creator_id: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
  creator_label: { type: "array", items: { type: "string" } },
  license: { $ref: "#/$defs/Uri" },
  other: { type: "string" },
  publication_date: { $ref: "#/$defs/Date" },
  see_also: { type: "array", items: { $ref: "#/$defs/Uri" } },
}

// See <https://mapping-commons.github.io/sssom/Mapping/>
export const mappingSchema = {
  type: "object",
  title: "Mapping",
  $defs,
  properties: {
    mapping_id: { $ref: "#/$defs/EntityReference" },
    subject_id: { $ref: "#/$defs/EntityReference" },
    subject_label: { type: "string" },
    subject_category: { type: "string" },
    predicate_id: { $ref: "#/$defs/EntityReference" },
    predicate_label: { type: "string" },
    predicate_modifier: { $ref: "#/$defs/PredicateModifier" },
    object_id: { $ref: "#/$defs/EntityReference" },
    object_label: { type: "string" },
    object_category: { type: "string" },
    mapping_justification: { $ref: "#/$defs/EntityReference" },
    author_id: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
    author_label: { type: "array", items: { type: "string" } },
    reviewer_id: { type: "array", items: { $ref: "#/$defs/EntityReference" } },
    reviewer_label: { type: "array", items: { type: "string" } },
    mapping_source: { $ref: "#/$defs/EntityReference" },
    mapping_cardinality: { $ref: "#/$defs/MappingCardinality" },
    confidence: { $ref: "#/$defs/Percentage" },
    match_string: { type: "array", items: { type: "string" } },
    similarity_score: { $ref: "#/$defs/Percentage" },
    issue_tracker_item: { $ref: "#/$defs/EntityReference" },
    ...propagatableSlots,
    ...commonSlots,
  },
  required: ["subject_id","predicate_id","object_id","mapping_justification"],
}

// See <https://mapping-commons.github.io/sssom/MappingSet/>
export const mappingSetSchema = {
  type: "object",
  title: "MappingSet",
  $defs,
  properties: {
    // curie_map is ignored
    // extension_definitions is ignored
    mappings: { type: "array", items: mappingSchema },
    mapping_set_id: { $ref: "#/$defs/Uri" },
    mapping_set_version: { type: "string" },
    mapping_set_source: { $ref: "#/$defs/Uri" },
    mapping_set_title: { type: "string" },
    mapping_set_description: { type: "string" },
    ...propagatableSlots,
    ...commonSlots,
  },
  required: ["mapping_set_id", "license"],
}
