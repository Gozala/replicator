// @flow strict

import { request } from "../../Effect/worker.js"

class Sandbox {
  /*::
  lastID:number
  resolve:mixed => void
  reject:mixed => void
  script:HTMLScriptElement
  handleEvent:Event => mixed
  */
  constructor() {
    this.lastID = 0
  }

  /**
   * @param {string} id
   * @param {string} code
   */
  evaluate(id, code) {
    const { document } = window
    const script = document.createElement("script")
    script.id = id
    script.setAttribute("defer", "defer")
    script.type = "module"
    script.addEventListener("error", this)
    script.addEventListener("evaluated", this)
    window.addEventListener("error", this)

    // @ts-ignore
    window[id] = (value, bindings) =>
      script.dispatchEvent(
        new CustomEvent("evaluated", {
          detail: { value, bindings },
        })
      )
    // const blob = new Blob([code], {
    //   type: "text/javascript"
    // })
    // script.src = URL.createObjectURL(blob)
    script.textContent = code
    this.script = script

    document.head.appendChild(script)
    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * @param {any} value
   */
  return(value) {
    const { resolve } = this
    if (resolve) {
      resolve(value)
    }
    this.finally()
  }

  /**
   * @param {Error} error
   */
  throw(error) {
    const { reject } = this
    if (reject) {
      reject(error)
    }
    this.finally()
  }
  finally() {
    const { script } = this
    if (script) {
      script.removeEventListener("evaluated", this)
      script.removeEventListener("error", this)
      window.removeEventListener("error", this)
      script.remove()
    }
    // URL.revokeObjectURL(script.src)
    // script.src = ""
    // @ts-ignore
    delete window[script.id]
    delete this.script
    delete this.resolve
    delete this.reject
  }

  /**
   * @param {Event & {error:Error, detail?:unknown}} event
   * @returns
   */
  handleEvent(event) {
    const { script } = this
    switch (event.target) {
      case window: {
        if (event.type === "error" /*&& event.filename === script.src*/) {
          return this.throw(event.error)
        }
        break
      }
      case script: {
        switch (event.type) {
          case "error": {
            return this.throw(event.error)
          }
          case "evaluated": {
            return this.return(event.detail)
          }
        }
        break
      }
    }
  }
}

const sandbox = new Sandbox()

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
  const evalID = `ø${++lastEvalindex}${Date.now().toString(32)}`
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
    const code = `${source};${evalID}(${out},${refs})${sourceURL}`
    const { bindings, value } = await sandbox.evaluate(evalID, code)
    Object.defineProperties(window, bindings)
    return value
  }
}

/**
 *
 * @param {string} id
 * @param {string} dir
 * @returns
 */
export const setSelection = (id, dir) => () => {
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
