import { createRequire } from "node:module"
export const require = createRequire(import.meta.url)
export const example = require("./valid/example.sssom.json")
