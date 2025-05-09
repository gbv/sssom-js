const sssomCm = CodeMirror.fromTextArea(document.getElementById("sssom-input"), {
  mode: "text/tab-separated-values",
  theme: "default",
  lineNumbers: true,
})
  
const jskosCm = CodeMirror(document.getElementById("jskos-output"), {
  mode: "javascript",
  theme: "default",
  lineNumbers: false,
  readOnly: true,
})

const parseInput = (options) => SSSOM.parseSSSOMString(sssomCm.getValue())

function validate () {
  document.getElementById("status").textContent = "..."
  jskosCm.setValue("")

  parseInput().then(sssom => {
    console.log("OK")
    document.getElementById("status").textContent = "OK"
    const jskos = SSSOM.toJskosRegistry(sssom)
    jskosCm.setValue(JSON.stringify(jskos, null, 2))
  }).catch(e => {
    console.error(e)
    document.getElementById("status").textContent = `${e}`
  })
}
