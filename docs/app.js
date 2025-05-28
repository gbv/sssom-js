/* global CodeMirror, SSSOM */
const $ = id => document.getElementById(id)

const cmInput = CodeMirror.fromTextArea($("sssom-input"), {
  mode: "text/tab-separated-values",
  lineNumbers: true,
  gutters: ["CodeMirror-lint-markers"],
  matchBrackets: true,
})
  
const cmResult = CodeMirror($("result"), {
  mode: "javascript",
  lineNumbers: true,
  readOnly: true,
})

function copyResult(e) { // eslint-disable-line no-unused-vars
  if (e.which == 1) {
    navigator.clipboard.writeText(cmResult.getValue())
  }
}

let marker

function validate () {
  const input = cmInput.getValue()
  const editor = $("sssom-input").nextSibling
  const resultFormat = $("to").value
  const options = {
    from: $("from").value,
    to: ["jskos","ndjskos"].includes(resultFormat) ? "jskos" : "json",
    mappings: $("mappingsOnly").checked,
    liberal: $("liberal").checked,
  }

  const showError = err => {
    cmResult.setValue("")
      
    let line = err.position?.line
    if (line) {
      line--
      const lines = input.split("\n")
      const ch = lines[line].length
      marker = cmInput.getDoc().markText({line,ch:0},{line,ch},{css: "background-color: #fcc"})
    }
    editor.classList.add("invalid")
    $("status").textContent = `${err}`
    $("status").classList.replace("valid","invalid")
  }

  const showResult = result => {
    editor.classList.add("valid")
    $("status").textContent = "Input is valid"
    $("status").classList.replace("invalid","valid")

    if (resultFormat === "ndjson" || resultFormat === "ndjskos") {
      const { mappings, ...metadata } = result
      const lines = options.mappings ? mappings : [ metadata, ...mappings ]
      cmResult.setOption("mode", "javascript")
      cmResult.setValue(lines.map(JSON.stringify).join("\n"))
    } else if (resultFormat === "nt" || resultFormat === "ttl") {
      result["@context"] = window.rdfContext
      window.jsonld.toRDF(result, {format: "application/n-quads"}).then(rdf => cmResult.setValue(rdf))
      //cmResult.setValue(JSON.stringify(result, null, 2))
      // TODO: syntax highlight ttl
      cmResult.setOption("mode", "turtle")
    } else {
      cmResult.setOption("mode", "javascript")
      cmResult.setValue(JSON.stringify(result, null, 2))
    }
  }

  if (marker) {
    marker.clear()
  }
  SSSOM.parseSSSOMString(input, options).then(showResult).catch(showError)
}

cmInput.on("change",validate)

validate()

if (window.jsonld) {
  fetch("context.json").then(res => res.json()).then(context => {
    window.rdfContext = context
    let opt = document.createElement("option")
    opt.value = "nt"
    opt.textContent = "NTriples"
    $("to").appendChild(opt)
    //opt = document.createElement("option")
    //opt.value = "ttl"
    //opt.textContent = "Turtle"
    //$("to").appendChild(opt)
  })
}
