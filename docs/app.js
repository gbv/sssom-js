const element = id => document.getElementById(id)

const sssomCm = CodeMirror.fromTextArea(element("sssom-input"), {
  mode: "text/tab-separated-values",
  lineNumbers: true,
  gutters: ["CodeMirror-lint-markers"],
  matchBrackets: true,
})
  
const jskosCm = CodeMirror(element("jskos-output"), {
  mode: "javascript",
  lineNumbers: false,
  readOnly: true,
})

var marker
function validate () {
  element("status").textContent = "..."
  const editor = element("sssom-input").nextSibling
  editor.classList.remove("valid")
  editor.classList.remove("invalid")
  jskosCm.setValue("")

  if (marker) marker.clear()

  const sssomTsv = sssomCm.getValue()
  SSSOM.parseSSSOMString(sssomTsv).then(sssom => {
    editor.classList.add("valid")
    element("status").textContent = "Valid SSSOM/TSV"
    const jskos = SSSOM.toJskosRegistry(sssom)
    jskosCm.setValue(JSON.stringify(jskos, null, 2))
  }).catch(e => {
    var line = e.position?.line
    if (line) {
      line--
      const lines = sssomTsv.split('\n')
      const ch = lines[line-1].length
      marker = sssomCm.getDoc().markText({line,ch:0},{line,ch},{css: "background-color: #fcc"});
    }
    editor.classList.add("invalid")
    element("status").textContent = `${e}`
  })
}

validate()
