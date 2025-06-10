import { parseDocument, YAMLSeq, YAMLMap } from "yaml"

export function positionString(pos) {
  if (typeof pos === "string") {
    return pos
  } else if (typeof pos === "object") {
    if (pos.linecol) {
      return "line " + pos.linecol.replace(":", "column ")
    } else if (pos.line) {
      return `line ${pos.line}`
    } else if (pos.rfc5147) {
      pos = pos.rfc5147.replace(/;.*/,"")  // remove integrity-check
      const type = pos.replace(/=.*/, "")
      const num = pos.replace(/.*=/,"").split(",")
      if (num[0]) num[0]++
      return `${type} ${num.join("-")}`
    } else if ("jsonpointer" in pos) {
      return `element ${pos.jsonpointer}`
    }
  }
}

function lineCol(str, offset) {
  const lines = str.slice(0, offset).split("\n")
  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1,
  }
}

export function yamlPosition(doc, path) {
  let node = parseDocument(doc, { keepSourceTokens: true }).contents

  if (typeof path === "string") { // parse JSON Pointer
    path = path.split("/").slice(1).map(s => s.replace(/~1/g, "/").replace(/~0/g, "~"))
  }

  while (node && path.length) {
    const elem = path.shift()
    if (node instanceof YAMLSeq) {
      node = node.items[Number(elem)]
    } else if (node instanceof YAMLMap) {
      // TODO: get full Pair instead of value
      // pair = node.items.find(({key, value}) => key.type === 'PLAIN' && key.value === elem)
      node = node.get(elem, true)
    } else {
      break
    }
    if (node && !path.length) {
      const [from, to] = node.range.map(offset => lineCol(doc, offset))
      // TODO: include column
      if (from.line == to.line) {
        return { line: from.line, rfc5147: `line=${from.line-1},${from.line}` }
      } else {
        return { rfc5147: `line=${from.line-1},${to.line-1}` }
      }
    }
  }

  return
}
