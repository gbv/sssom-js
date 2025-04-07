import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
export const example = require("./valid/example.sssom.json")
