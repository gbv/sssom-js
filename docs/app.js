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
      cmResult.setValue(lines.map(JSON.stringify).join("\n"))
    } else {
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
