// @ts-nocheck

/*::
export type Decode<a> = a | Error

export interface Decoder<inn, out> {
  decode(inn): Error | out;
}

export interface Reader<a> {
  read(string):?a;
}

export opaque type float:number = number
export opaque type integer:number = number
*/

export class DecodeError extends Error /*::implements Decoder<mixed, any>*/ {
  /*::
  reason: string
  name: string = "Error"
  type = "Error"
  */
  constructor(reason /*: string*/ = "") {
    super()
    this.reason = reason
  }
  get message() {
    return this.describe("")
  }
  /*::
  set message(_:string) {}
  */
  describe(context /*:string*/) /*:string*/ {
    return `${this.where(context)}${this.reason}`
  }
  where(context /*:string*/) /*:string*/ {
    const result = context == `` ? `` : ` at ${context}`

    return result
  }
  toJSON() {
    return {
      type: "Error",
      message: this.message,
    }
  }
  decode() {
    return this
  }
}

const anArticle = /^(a|e[^u]|i|o|u)/i
const articleFor = (word) => (anArticle.test(word) ? "an" : "a")
const symbolType /*:any*/ = "symbol"
const serialize = (value /*:mixed*/) /*:string*/ => {
  switch (typeof value) {
    case "boolean":
      return StringConstructor(value)
    case "string":
      return JSON.stringify(value)
    case "number":
      return `${value}`
    case "undefined":
      return "undefined"
    case symbolType:
      return StringConstructor(value)
    case "function": {
      try {
        return `${value.toString()}`
      } catch (_) {
        return `function() {/*...*/}`
      }
    }
    case "object":
    default: {
      if (value === null) {
        return `null`
      } else {
        try {
          const json = JSON.stringify(value)
          switch (json.charAt(0)) {
            case "{":
              return json
            case "[":
              return json
            case "t":
              return `new Boolean(true)`
            case "f":
              return `new Boolean(false)`
            case '"':
              return `new String(${json})`
            default:
              return `new Number(${json})`
          }
        } catch (_) {
          return `{/*...*/}`
        }
      }
    }
  }
}

export class ValueError extends DecodeError {
  /*::
  expect: string
  actual: mixed
  article: string
  */
  constructor(
    expect /*:string*/,
    actual /*:mixed*/,
    article /*:string*/ = articleFor(expect)
  ) {
    super()
    this.actual = actual
    this.expect = expect
    this.article = article
  }
  describe(context /*:string*/) /*:string*/ {
    const where = this.where(context)
    const actual = serialize(this.actual)
    const expect = `${this.article} ${this.expect}`

    return `Expecting ${expect}${where} but instead got: \`${actual}\``
  }
}

export class MissmatchError extends DecodeError {
  /*::
  expect: mixed
  actual: mixed
  */
  constructor(actual /*: mixed*/, expect /*: mixed*/) {
    super()
    this.actual = actual
    this.expect = expect
  }
  describe(context /*:string*/) /*:string*/ {
    const where = this.where(context)
    const actual = serialize(this.actual)
    const expect = serialize(this.expect)

    return `Expecting \`${expect}\`${where} but instead got: \`${actual}\``
  }
}

export class ThrownError extends DecodeError {
  /*::
  exception: { message: string }
  */
  constructor(exception /*: { message: string }*/) {
    super()
    this.exception = exception
  }
  describe(context /*: string*/) /*:string*/ {
    return `An exception was thrown by ${context}: ${this.exception.message}`
  }
}

export const Float = class AFloat /*::implements Decoder<mixed, float>*/ {
  read(input /*:string*/) /*:?float*/ {
    switch (input) {
      case "":
        return null
      default: {
        if (/[\sxbo]/.test(input)) {
          return null
        } else {
          const n = +input
          switch (n) {
            case Infinity:
              return null
            case -Infinity:
              return null
            // Faster isNaN check
            case n:
              return n
            default:
              return null
          }
        }
      }
    }
  }
  decode(input /*:mixed*/) {
    if (Number.isFinite(input) && typeof input === "number") {
      return input
    } else {
      return new ValueError("Float", input)
    }
  }
}

export const Integer = new (class AnInteger /*::implements Decoder<mixed, integer>*/ {
  fromNumber(value /*: number*/) /*: integer*/ {
    switch (value) {
      case +Infinity:
        return Number.MAX_SAFE_INTEGER
      case -Infinity:
        return Number.MIN_SAFE_INTEGER
      case value:
        return value
      default:
        return 0
    }
  }
  round(value /*: number*/) /*: integer*/ {
    return Integer.fromNumber(Math.round(value))
  }

  floor(value /*: number*/) /*: integer*/ {
    return Integer.fromNumber(Math.floor(value))
  }

  ceiling(value /*: number*/) /*: integer*/ {
    return Integer.fromNumber(Math.ceil(value))
  }

  truncate(value /*: number*/) /*: integer*/ {
    return value | 0
  }

  div(a /*: integer*/, b /*: integer*/) /*: integer*/ {
    return (a / b) | 0
  }

  rem(a /*: integer*/, b /*: integer*/) /*: integer*/ {
    return a % b
  }

  mod(a /*: integer*/, b /*: integer*/) /*: integer*/ {
    if (b === 0) {
      throw new TypeError("Cannot perform mod 0. Division by zero error.")
    }
    const r = a % b
    const m = a === 0 ? 0 : b > 0 ? (a >= 0 ? r : r + b) : -Integer.mod(-a, -b)

    return m === b ? 0 : m
  }

  parse(input /*:string*/) /*:?integer*/ {
    const size = input.length
    if (size === 0) {
      return null
    } else {
      const ch = input[0]
      if (ch === "0" && input[1] === "x") {
        for (let i = 2; i < size; ++i) {
          const ch = input[i]
          if (
            ("0" <= ch && ch <= "9") ||
            ("A" <= ch && ch <= "F") ||
            ("a" <= ch && ch <= "f")
          ) {
            continue
          }
          return null
        }

        return parseInt(input, 16)
      }

      if (
        ch > "9" ||
        (ch < "0" && ((ch !== "-" && ch !== "+") || size === 1))
      ) {
        return null
      }

      for (let i = 1; i < size; ++i) {
        const ch = input[i]
        if (ch < "0" || "9" < ch) {
          return null
        }
      }

      return parseInt(input, 10)
    }
  }
  decode(input /*:mixed*/) {
    // Note that if `Number.isInteger(x)` returns `true` we know that `x` is an
    // integer number, but flow can not infer that, there for we trick flow into
    // thinking we also perform typeof input === "number" so it can narrow down
    // type to a number.
    if (Number.isInteger(input) && typeof input === "number") {
      return Integer.truncate(input)
    } else {
      return new ValueError("Integer", input)
    }
  }
})()

export const Boolean = new (class ABoolean /*::implements Decoder<mixed, boolean>*/ {
  read(input /*:string*/) /*:?boolean*/ {
    switch (input) {
      case "true":
        return true
      case "false":
        return false
      default:
        return null
    }
  }
  decode(input /*: mixed*/) /*: Decode<boolean>*/ {
    switch (input) {
      case true:
        return true
      case false:
        return false
      default:
        return new ValueError("Boolean", input)
    }
  }
})()

const StringConstructor = "".constructor
export const String = new (class AString /*:: implements Decoder<mixed, string>*/ {
  decode(input /*: mixed*/) /*: Decode<string>*/ {
    if (typeof input === "string") {
      return input
    } else if (input instanceof StringConstructor) {
      return `${input}`
    } else {
      return new ValueError("String", input)
    }
  }
})()

class Maybe /*::<a> implements Decoder<mixed, ?a>*/ {
  /*::
  decoder: Decoder<mixed, a>
  */
  constructor(decoder /*: Decoder<mixed, a>*/) {
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<?a>*/ {
    const value = this.decoder.decode(input)
    if (value instanceof Error) {
      if (input == null) {
        return value
      } else {
        return null
      }
    } else {
      return value
    }
  }
}
export const maybe = /*::<a>*/ (
  decoder /*: Decoder<mixed, a>*/
) /*:Decoder<mixed, ?a>*/ => new Maybe(decoder)

class Null /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  fallback: a
  */
  constructor(fallback /*: a*/) {
    this.fallback = fallback
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    if (input === null) {
      return this.fallback
    } else {
      return new ValueError("null", input)
    }
  }
}

export const annul = /*::<a>*/ (value /*: a*/) /*: Decoder<mixed, a>*/ =>
  new Null(value)

class Void /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  fallback: a
  */
  constructor(fallback /*: a*/) {
    this.fallback = fallback
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    if (input === undefined) {
      return this.fallback
    } else {
      return new ValueError("undefined", input)
    }
  }
}

export const avoid = /*::<a>*/ (value /*: a*/) /*: Decoder<mixed, a>*/ =>
  new Void(value)

class Optional /*::<a> implements Decoder<mixed, ?a>*/ {
  /*::
  decoder: Decoder<mixed, a>
  */
  constructor(decoder /*: Decoder<mixed, a>*/) {
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<?a>*/ {
    const value = this.decoder.decode(input)
    if (value instanceof Error) {
      if (input == null) {
        return null
      } else {
        return value
      }
    } else {
      return value
    }
  }
}

export const optional = /*::<a>*/ (
  decoder /*: Decoder<mixed, a>*/
) /*:Decoder<mixed, ?a>*/ => new Optional(decoder)

/*::
export type Record<a> = Decoder<mixed, Object | $ObjMap<a, <b>(Decoder<mixed, b>) => b>>
export type Fields<a> = {[string]:Decoder<mixed, mixed>} & $ObjMap<a, <b>(b) => Decoder<mixed, b>>
*/

class FieldError extends DecodeError {
  /*::
  field: string
  problem: DecodeError
  */
  constructor(field /*: string*/, error /*: Error*/) {
    super()
    this.field = field
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }
  describe(context /*: string*/) /*: string*/ {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}["${this.field}"]`)
  }
}

class Field /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  name: string
  decoder: Decoder<mixed, a>
  */
  constructor(name /*: string*/, decoder /*: Decoder<mixed, a>*/) {
    this.name = name
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { name, decoder } = this
    switch (typeof input) {
      case "function":
      case "object": {
        if (input === null) {
          break
        } else {
          try {
            const value = decoder.decode(input[name])
            if (value instanceof Error) {
              const object /*:Object*/ = input
              if (name in object) {
                return new FieldError(name, value)
              } else {
                break
              }
            } else {
              return value
            }
          } catch (error) {
            return new FieldError(name, new ThrownError(error))
          }
        }
      }
    }
    return new ValueError(`object with a field named '${name}'`, input)
  }
}

export const field = /*::<a>*/ (
  name /*: string*/,
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, a>*/ => new Field(name, decoder)

export const at = /*::<a>*/ (
  path /*: string[]*/,
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, a>*/ =>
  path.reduceRight((decoder, name) => field(name, decoder), decoder)

class RecordDecoder /*::<a:{}> implements Decoder<mixed, a>*/ {
  /*::
  fields: Fields<a>
  */
  constructor(fields /*: Fields<a>*/) {
    this.fields = fields
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { fields } = this
    if (typeof input === "object" && input !== null) {
      const result /*: Object*/ = {}
      for (let key of Object.keys(fields)) {
        try {
          const decoder = fields[key]
          const value = fields[key].decode(input[key])
          if (value instanceof Error) {
            return new FieldError(key, value)
          } else {
            result[key] = value
          }
        } catch (error) {
          return new FieldError(key, new ThrownError(error))
        }
      }

      return result
    } else {
      return new ValueError("object", input)
    }
  }
}

export const record = /*::<a:{}>*/ (fields /*: a*/) /*: Record<a>*/ =>
  new RecordDecoder(fields)

class Form /*::<a:{}> implements Decoder<mixed, a>*/ {
  /*::
  fields: Fields<a>
  */
  constructor(fields /*: Fields<a>*/) {
    this.fields = fields
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { fields } = this
    const record /*: Object*/ = {}
    for (let key of Object.keys(fields)) {
      const value = fields[key].decode(input)
      if (value instanceof Error) {
        return value
      } else {
        record[key] = value
      }
    }
    return record
  }
}

export const form = /*::<a:{}>*/ (fields /*:a*/) /*:Record<a>*/ =>
  new Form(fields)

class IndexError extends DecodeError {
  /*::
  index: number
  problem: DecodeError
  */
  constructor(index /*: number*/, error /*: Error*/) {
    super()
    this.index = index
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }
  describe(context /*: string*/) /*: string*/ {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}[${this.index}]`)
  }
}

class Index /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  index: number
  decoder: Decoder<mixed, a>
  */
  constructor(index /*: number*/, decoder /*: Decoder<mixed, a>*/) {
    this.index = index
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { index, decoder } = this
    if (!Array.isArray(input)) {
      return new ValueError("array", input)
    } else if (index >= input.length) {
      return new ValueError(`longer (>=${index + 1}) array`, input)
    } else {
      try {
        const value = decoder.decode(input[index])
        if (value instanceof Error) {
          return new IndexError(index, value)
        } else {
          return value
        }
      } catch (error) {
        return new IndexError(index, new ThrownError(error))
      }
    }
  }
}

export const index = /*::<a>*/ (
  index /*: number*/,
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, a>*/ => new Index(index, decoder)

class ArrayDecoder /*::<a> implements Decoder<mixed, a[]>*/ {
  /*::
  decoder: Decoder<mixed, a>
  */
  constructor(decoder /*: Decoder<mixed, a>*/) {
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*:Decode<a[]>*/ {
    if (Array.isArray(input)) {
      let index = 0
      const array = []
      const { decoder } = this
      for (let element of input) {
        const value = decoder.decode(element)
        if (value instanceof Error) {
          return new IndexError(index, value)
        } else {
          array[index] = value
        }
        index++
      }
      return array
    } else {
      return new ValueError("Array", input)
    }
  }
}

export const array = /*::<a>*/ (
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, a[]>*/ => new ArrayDecoder(decoder)

export class AccessorError extends DecodeError {
  /*::
  accessor: string
  problem: DecodeError
  */
  constructor(accessor /*: string*/, error /*: Error*/) {
    super()
    this.accessor = accessor
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }
  describe(context /*: string*/) /*: string*/ {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}["${this.accessor}"]()`)
  }
}

class Accessor /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  name: string
  decoder: Decoder<mixed, a>
  */
  constructor(name /*: string*/, decoder /*: Decoder<mixed, a>*/) {
    this.name = name
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { name, decoder } = this
    if (typeof input === "object" && input != null && name in input) {
      const object /*: Object*/ = input
      try {
        if (typeof object[name] === "function") {
          const value = decoder.decode(object[name]())
          if (value instanceof Error) {
            return new AccessorError(name, value)
          } else {
            return value
          }
        } else {
          return new FieldError(name, new ValueError("function", object[name]))
        }
      } catch (error) {
        return new AccessorError(name, new ThrownError(error))
      }
    } else {
      return new ValueError(`object with a method named '${name}'`, input)
    }
  }
}

export const accessor = /*::<a>*/ (
  name /*: string*/,
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, a>*/ => new Accessor(name, decoder)

/*::
export type Dictionary<a> = { [string]: a }
*/

class DictionaryDecoder /*::<a> implements Decoder<mixed, Dictionary<a>>*/ {
  /*::
  decoder: Decoder<mixed, a>
  */
  constructor(decoder /*: Decoder<mixed, a>*/) {
    this.decoder = decoder
  }
  decode(input /*: mixed*/) /*: Decode<Dictionary<a>>*/ {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return new ValueError("object", input)
    } else {
      const { decoder } = this
      const object /*:Object*/ = Object.create(null)
      const dictionary /*: Dictionary<a>*/ = object
      for (let key in input) {
        try {
          const value = decoder.decode(input[key])
          if (value instanceof Error) {
            return new FieldError(key, value)
          } else {
            dictionary[key] = value
          }
        } catch (error) {
          return new FieldError(key, new ThrownError(error))
        }
      }
      return dictionary
    }
  }
}

export const dictionary = /*::<a>*/ (
  decoder /*: Decoder<mixed, a>*/
) /*: Decoder<mixed, Dictionary<a>>*/ => new DictionaryDecoder(decoder)

class EitherError extends DecodeError {
  /*::
  problems: DecodeError[]
  */
  constructor(problems /*: DecodeError[]*/) {
    super()
    this.problems = problems
  }
  describe(context /*: string*/) /*: string*/ {
    const { problems } = this
    const descriptions = problems
      .map((problem) => problem.describe(context))
      .join("\n")
    const where = this.where(context)

    return `Ran into the following problems${where}:\n\n${descriptions}`
  }
}

class Either /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  either: Decoder<mixed, a>[]
  */
  constructor(decoders /*: Decoder<mixed, a>[]*/) {
    this.either = decoders
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { either } = this
    let problems = null
    for (let decoder of either) {
      const value = decoder.decode(input)
      if (value instanceof Error) {
        problems = problems == null ? [value] : (problems.push(value), problems)
      } else {
        return value
      }
    }

    return new EitherError(problems || [])
  }
}

export const either = /*::<a>*/ (
  decoders /*: Decoder<mixed, a>[]*/
) /*: Decoder<mixed, a>*/ => new Either(decoders)

export const or = /*::<a>*/ (
  ...decoders /*: Decoder<mixed, a>[]*/
) /*: Decoder<mixed, a>*/ => new Either(decoders)

class Ok /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  value: a
  */
  constructor(value /*: a*/) {
    this.value = value
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    return this.value
  }
}

export const ok = /*::<a>*/ (value /*: a*/) /*: Decoder<mixed, a>*/ =>
  new Ok(value)

export const error = /*::<a>*/ (reason /*: string*/) /*: Decoder<mixed, a>*/ =>
  new DecodeError(reason)

class And /*::<a, b> implements Decoder<mixed, b>*/ {
  /*::
  left: Decoder<mixed, a>
  right: Decoder<mixed, b>
  */
  constructor(left /*: Decoder<mixed, a>*/, right /*: Decoder<mixed, b>*/) {
    this.left = left
    this.right = right
  }
  decode(input /*: mixed*/) /*: Decode<b>*/ {
    const { left, right } = this
    const result = left.decode(input)
    if (result instanceof Error) {
      return result
    } else {
      return right.decode(input)
    }
  }
}

export const and = /*::<a, b>*/ (
  left /*: Decoder<mixed, a>*/,
  right /*: Decoder<mixed, b>*/
) /*: Decoder<mixed, b>*/ => new And(left, right)

class Match /*::<a> implements Decoder<mixed, a>*/ {
  /*::
  expect: a
  */
  constructor(expect /*: a*/) {
    this.expect = expect
  }
  decode(input /*: mixed*/) /*: Decode<a>*/ {
    const { expect } = this
    if (matches(input, expect)) {
      return expect
    } else {
      return new MissmatchError(input, expect)
    }
  }
}

const matches = /*::<a>*/ (actual /*: a*/, expected /*: a*/) /*: boolean*/ => {
  if (actual === expected) {
    return true
  } else {
    if (
      actual &&
      typeof actual === "object" &&
      expected &&
      typeof expected === "object"
    ) {
      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          const count = expected.length
          let index = 0
          let isMatch = count <= actual.length
          while (isMatch && index < count) {
            isMatch = matches(actual[index], expected[index])
            index++
          }
          return isMatch
        } else {
          return false
        }
      } else {
        for (const key in expected) {
          if (Object.prototype.hasOwnProperty.call(expected, key)) {
            if (!matches(actual[key], expected[key])) {
              return false
            }
          }
        }
        return true
      }
    } else {
      return false
    }
  }
}

export const match = /*::<a>*/ (value /*: a*/) /*: Decoder<mixed, a>*/ =>
  new Match(value)
