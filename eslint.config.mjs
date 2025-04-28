import globals from "globals"
import gbv from "eslint-config-gbv"

export default [
  ...gbv,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
	  ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      "no-case-declarations": "off",
    },
  }]
