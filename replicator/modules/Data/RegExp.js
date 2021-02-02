/**
 * @typedef {string | number | RegExp | Re} Param
 * @typdef {string[]} Literals
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
  static new(raw /*:string[]*/, params /*:Param[]*/, flags /*:string*/) {
    let source = ""
    let offset = 0
    let count = raw.length
    while (offset < count) {
      source += raw[offset]
      offset += 1
      if (params.length > 0) {
        const param = params.shift()
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
  constructor(source /*:string*/, flags /*:string*/ = "") {
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
  test(text /*:string*/) {
    const { regExp } = this
    regExp.lastIndex = 0
    return regExp.test(text)
  }
  split(text /*:string*/) /*:string[]*/ {
    const { regExp } = this
    regExp.lastIndex = 0
    return text.split(regExp)
  }
  replace(source /*:string*/, replacement /*:string*/) /*:string*/ {
    const { regExp } = this
    regExp.lastIndex = 0
    return source.replace(regExp, replacement)
  }
  replaceWith(source /*:string*/, replacer /*:Replacer*/) /*:string*/ {
    const { regExp } = this
    regExp.lastIndex = 0
    return source.replace(regExp, (match, ...args) => {
      const source = args.pop()
      const offset /*:any*/ = args.pop()
      return replacer({ match, captured: args, source, offset })
    })
  }
  search(text /*:string*/, offset /*:number*/ = 0) /*:number*/ {
    const { regExp } = this
    regExp.lastIndex = offset
    return text.search(regExp)
  }
  toString() {
    return `re\`${this.source}\``
  }
}

const compile = ({ raw } /*:any*/, params /*:Param[]*/) => {
  let source = ""
  let offset = 0
  let count = raw.length
  while (offset < count) {
    source += raw[offset]
    offset += 1
    if (params.length > 0) {
      const param = params.shift()
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

export const re = (literals /*:Literals*/, ...params /*:Param[]*/) =>
  new Re(compile(literals, params))

export const regex = (literals /*:Literals*/, ...params /*:Param[]*/) => (
  flags /*:string[]*/
) => new Re(compile(literals, params), flags.join(""))
