import { parseContext, CurieUtil } from "@geneontology/curie-util-es5"
import { DetailledError } from "./error.js"

const buildIn = {
  owl:	"http://www.w3.org/2002/07/owl#",
  rdf:	"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs:	"http://www.w3.org/2000/01/rdf-schema#",
  semapv:	"https://w3id.org/semapv/vocab/",
  skos:	"http://www.w3.org/2004/02/skos/core#",
  sssom:	"https://w3id.org/sssom/",
  xsd:	"http://www.w3.org/2001/XMLSchema#",
  linkml:	"https://w3id.org/linkml/",
}

export class CurieMap {
  constructor(map, fallback={}) {
    map = map ? { ...map, ...fallback, ...buildIn } : { ...fallback, ...buildIn }
    map = parseContext({ ["@context"]: map })
    this.map = new CurieUtil(map)
  }

  getIri(curie) {
    return this.map.getIri(curie)
  }

  getCurie(iri) {
    return this.mapgetCurie(iri)
  }

  entityReference(value) {
    const iri = this.getIri(value)
    if (iri) {
      return iri
    } else {
      throw new DetailledError("Unknown or invalid CURIE", { value })
    }
  }
}
