import { request } from "../../Effect/worker.js"

/**
 * @param {string} name
 * @returns
 */
const generateAccessor = (name) =>
  `${name}:{configurable:true,enumerable:true,get(){return ${name}},set(ø){${name}=ø}}`

/**
 * @param {Object} options
 * @param {string[]} options.bindings
 */
const generateBindings = ({ bindings }) => {
  const accessors = []
  for (const name of [...bindings]) {
    const descriptor = Object.getOwnPropertyDescriptor(window, name)
    if (descriptor == null || descriptor.configurable) {
      accessors.push(generateAccessor(name))
    }
  }

  return `{${accessors.join(",")}}`
}

let lastEvalindex = 0

/**
 * @param {string} url
 * @param {string} code
 * @returns
 */
export const evaluate = (url, code) => async () => {
  const id = `ø${++lastEvalindex}${Date.now().toString(32)}`
  const index = Math.max(code.lastIndexOf("\n"), 0)
  const expression = code.slice(code.indexOf(":", index) + 1).trim()
  const source = `${code.slice(0, index)}\n`

  const result /*:any*/ = await analyze(code)
  if (result.error) {
    switch (result.error.name) {
      case "SyntaxError": {
        throw new SyntaxError(result.error.message)
      }
      default: {
        throw new Error(result.error)
      }
    }
  } else {
    const sourceURL = `\n//# sourceURL=${url}`
    const refs = generateBindings(result.ok)
    const out = expression === "" ? "void 0" : expression
    const code = `${source}\nexport const ${id}=[${out},${refs}]`

    const module = await importCode(code)
    const [value, bindings] = module[id]

    Object.defineProperties(window, bindings)
    return value
  }
}

/**
 * @param {string} code 
 */
const importCode = async (code) => {
  const blob = new Blob([code], {
    type: "text/javascript"
  })
  const url = URL.createObjectURL(blob)
  try {
    return await import(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 *
 * @param {string} id
 * @param {string} dir
 * @returns
 */
export const setSelection = (id, dir) => async () => {
  const target = document.getElementById(id)
  if (target && target.localName === "code-block") {
    const codeBlock /*:Object*/ = target
    codeBlock.focus()
    // @ts-ignore
    codeBlock.setSelection(dir)
  } else {
    throw Error(`<code-block/> with id ${id} was not found`)
  }
}

const analyzer = new URL("../Worker/analyzer.bundle.js", import.meta.url)

/**
 * @param {string} source
 */
const analyze = (source) => request(analyzer, source)
