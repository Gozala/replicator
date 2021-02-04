/**
 * @typedef {"g"|"i"|"m"|"s"|"u"|"y"} Flag
 * @typedef {string | number | RegExp | Re} Param
 * @typedef {(match:{match:string, captured:string[], offset:number, source:string}) => string} Replacer
 */

class Re {
  /*::
  +source:string
  +flags:string
  +regExp:RegExp
  +global:boolean
  +ignoreCase:boolean
  +multiline:boolean
  +sticky:boolean
  +unicode:boolean
  */

  /**
   * @param {TemplateStringsArray} raw
   * @param {Param[]} params
   * @returns {Re}
   */
  static new(raw, params) {
    let source = ""
    let offset = 0
    let count = raw.length
    while (offset < count) {
      source += raw[offset]
      offset += 1
      if (params.length > 0) {
        const param = /** @type {Param} */ (params.shift())
        switch (typeof param) {
          case "string": {
            source += param
            break
          }
          case "number": {
            source += String(param)
            break
          }
          default: {
            source += param.source
            break
          }
        }
      }
    }
    return new Re(source)
  }

  /**
   * @param {string} source
   * @param {string} [flags]
   */
  constructor(source, flags = "") {
    const regExp = new RegExp(source, flags)
    this.regExp = regExp
    this.source = source
    this.flags = flags
    const { global, ignoreCase, multiline, sticky, unicode } = regExp
    this.global = global
    this.ignoreCase = ignoreCase
    this.multiline = multiline
    this.sticky = sticky
    this.unicode = unicode
  }

  /**
   * @param {string} text
   * @returns {boolean}
   */
  test(text /*:string*/) {
    const { regExp } = this
    regExp.lastIndex = 0
    return regExp.test(text)
  }

  /**
   * @param {string} text
   * @returns {string[]}
   */
  split(text) {
    const { regExp } = this
    regExp.lastIndex = 0
    return text.split(regExp)
  }

  /**
   * @param {string} source
   * @param {string} replacement
   * @returns {string}
   */
  replace(source, replacement) {
    const { regExp } = this
    regExp.lastIndex = 0
    return source.replace(regExp, replacement)
  }

  /**
   * @param {string} source
   * @param {Replacer} replacer
   * @returns {string}
   */
  replaceWith(source, replacer) {
    const { regExp } = this
    regExp.lastIndex = 0
    return source.replace(regExp, (match, ...args) => {
      const source = args.pop()
      const offset /*:any*/ = args.pop()
      return replacer({ match, captured: args, source, offset })
    })
  }

  /**
   *
   * @param {string} text
   * @param {number} [offset=0]
   * @returns {number}
   */
  search(text, offset = 0) {
    const { regExp } = this
    regExp.lastIndex = offset
    return text.search(regExp)
  }
  toString() {
    return `re\`${this.source}\``
  }
}

/**
 *
 * @param {TemplateStringsArray} literals
 * @param {Param[]} params
 * @returns
 */
const compile = ({ raw }, params) => {
  let source = ""
  let offset = 0
  let count = raw.length
  while (offset < count) {
    source += raw[offset]
    offset += 1
    if (params.length > 0) {
      const param = /** @type {Param} */ (params.shift())
      switch (typeof param) {
        case "string": {
          source += param
          break
        }
        case "number": {
          source += String(param)
          break
        }
        default: {
          source += param.source
          break
        }
      }
    }
  }
  return source
}

/**
 *
 * @param {TemplateStringsArray} literals
 * @param  {Param[]} params
 * @returns
 */
export const re = (literals, ...params) => new Re(compile(literals, params))

/**
 *
 * @param {TemplateStringsArray} literals
 * @param  {Param[]} params
 * @returns
 */
export const regex = (literals, ...params) =>
  /**
   * @param {Flag[]} flags
   */
  (flags /*:string[]*/) => new Re(compile(literals, params), flags.join(""))
