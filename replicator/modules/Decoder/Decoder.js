import * as Decoder from "./Decoder/Decoder.js"

/**
 * @implements {Decoder.Decoder<any, never>}
 */
export class DecodeError extends Error {
  /**
   * @param {string} [reason]
   */
  constructor(reason = "") {
    super()
    this.reason = reason
  }
  get message() {
    return this.describe("")
  }

  /**
   * @param {string} context
   * @returns {string}
   */
  describe(context) {
    return `${this.where(context)}${this.reason}`
  }

  /**
   *
   * @param {string} context
   * @returns {string}
   */
  where(context) {
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
/**
 *
 * @param {string} word
 * @returns {"an"|"a"}
 */
const articleFor = (word) => (anArticle.test(word) ? "an" : "a")
const symbolType /*:any*/ = "symbol"
/**
 * @param {unknown} value
 * @returns {string}
 */
const serialize = (value /*:mixed*/) /*:string*/ => {
  switch (typeof value) {
    case "boolean":
      return String(value)
    case "string":
      return JSON.stringify(value)
    case "number":
      return `${value}`
    case "undefined":
      return "undefined"
    case symbolType:
      return String(value)
    case "function": {
      try {
        return `${value}`
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
  /**
   * @param {string} expect
   * @param {unknown} actual
   * @param {string} article
   */
  constructor(expect, actual, article = articleFor(expect)) {
    super()
    this.actual = actual
    this.expect = expect
    this.article = article
  }
  /**
   * @param {string} context
   * @returns {string}
   */
  describe(context) {
    const where = this.where(context)
    const actual = serialize(this.actual)
    const expect = `${this.article} ${this.expect}`

    return `Expecting ${expect}${where} but instead got: \`${actual}\``
  }
}

export class MissmatchError extends DecodeError {
  /**
   * @param {unknown} actual
   * @param {unknown} expect
   */
  constructor(actual, expect) {
    super()
    this.actual = actual
    this.expect = expect
  }

  /**
   * @param {string} context
   * @returns {string}
   */
  describe(context) {
    const where = this.where(context)
    const actual = serialize(this.actual)
    const expect = serialize(this.expect)
    return `Expecting \`${expect}\`${where} but instead got: \`${actual}\``
  }
}

/**
 * @template {{message:string}} X
 */
export class ThrownError extends DecodeError {
  /**
   * @param {X} exception
   */
  constructor(exception) {
    super()
    this.exception = exception
  }
  /**
   *
   * @param {string} context
   * @returns {string}
   */
  describe(context) {
    return `An exception was thrown by ${context}: ${this.exception.message}`
  }
}

/**
 * @implements {Decoder.Decoder<any, Decoder.float>}
 */
class FloatDecoder {
  /**
   * @param {string} input
   * @returns {?Decoder.float}
   */
  parse(input) {
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
              // @ts-ignore
              return n
            default:
              return null
          }
        }
      }
    }
  }
  /**
   *
   * @param {any} input
   * @returns {Decoder.Decode<Decoder.float>}
   */
  decode(input /*:mixed*/) {
    if (Number.isFinite(input) && typeof input === "number") {
      // @ts-expect-error - not a phantom type
      return input
    } else {
      return new ValueError("Float", input)
    }
  }
}

export const Float = new FloatDecoder()

/**
 * @implements {Decoder.Decoder<any, Decoder.integer>}
 */
class IntegerDecoder {
  /**
   * @param {string} input
   * @returns {?Decoder.integer}
   */
  parse(input) {
    const size = input.length
    if (size === 0) {
      return null
    } else {
      const ch = /** @type {string} */ (input[0])
      if (ch === "0" && input[1] === "x") {
        for (let i = 2; i < size; ++i) {
          const ch = /** @type {string} */ (input[i])
          if (
            ("0" <= ch && ch <= "9") ||
            ("A" <= ch && ch <= "F") ||
            ("a" <= ch && ch <= "f")
          ) {
            continue
          }
          return null
        }

        // @ts-ignore
        return parseInt(input, 16)
      }

      if (
        ch > "9" ||
        (ch < "0" && ((ch !== "-" && ch !== "+") || size === 1))
      ) {
        return null
      }

      for (let i = 1; i < size; ++i) {
        const ch = /** @type {string} */ (input[i])
        if (ch < "0" || "9" < ch) {
          return null
        }
      }

      // @ts-ignore
      return parseInt(input, 10)
    }
  }
  /**
   * @param {any} input
   * @returns {Decoder.Decode<Decoder.integer>}
   */
  decode(input) {
    // Note that if `Number.isInteger(x)` returns `true` we know that `x` is an
    // integer number, but flow can not infer that, there for we trick flow into
    // thinking we also perform typeof input === "number" so it can narrow down
    // type to a number.
    if (Number.isInteger(input) && typeof input === "number") {
      // @ts-expect-error
      return input | 0
    } else {
      return new ValueError("Integer", input)
    }
  }
}

export const Integer = new IntegerDecoder()

/**
 * @implements {Decoder.Decoder<any, boolean>}
 */
class BooleanDecoder {
  /**
   * @param {string} input
   */
  parse(input) {
    switch (input) {
      case "true":
        return true
      case "false":
        return false
      default:
        return null
    }
  }

  /**
   * @param {any} input
   */
  decode(input) {
    switch (input) {
      case true:
        return true
      case false:
        return false
      default:
        return new ValueError("Boolean", input)
    }
  }
}
export const Boolean = new BooleanDecoder()

/**
 * @implements {Decoder.Decoder<any, string>}
 */
class TextDecoder {
  /**
   * @param {any} input
   * @returns {Decoder.Decode<string>}
   */
  decode(input) {
    if (typeof input === "string") {
      return input
    } else if (input instanceof String) {
      return `${input}`
    } else {
      return new ValueError("String", input)
    }
  }
}
export const Text = new TextDecoder()

/**
 * @template {NonNullable<any>} T
 * @implements {Decoder.Decoder<any, ?T>}
 */
class Maybe {
  /**
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(decoder) {
    this.decoder = decoder
  }
  /**
   * @param {any} input
   */
  decode(input) {
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

/**
 * @template {NonNullable<any>} T
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const maybe = (decoder) => new Maybe(decoder)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Null {
  /**
   * @param {T} fallback
   */
  constructor(fallback) {
    this.fallback = fallback
  }
  /**
   * @param {any} input
   */
  decode(input) {
    if (input === null) {
      return this.fallback
    } else {
      return new ValueError("null", input)
    }
  }
}

/**
 * Creates a decoder that decodes `null` as provided `value`.
 *
 * @template T
 * @param {T} value
 */
export const replaceNull = (value) => new Null(value)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Undefined {
  /**
   * @param {T} fallback
   */
  constructor(fallback) {
    this.fallback = fallback
  }
  /**
   * @param {any} input
   */
  decode(input) {
    if (input === undefined) {
      return this.fallback
    } else {
      return new ValueError("undefined", input)
    }
  }
}

/**
 * Creates a decoder that decodes `undefined` as provided `value`.
 *
 * @template T
 * @param {T} value
 */
export const replaceUndefined = (value) => new Undefined(value)

/**
 * @template T
 * @implements {Decoder.Decoder<any, ?T>}
 */
class Optional {
  /**
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(decoder) {
    this.decoder = decoder
  }
  /**
   *
   * @param {any} input
   */
  decode(input) {
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

/**
 * Turns a given `decoder` into an optional decoder, which will either
 * decodes value with a given decoder or as `null|undefined`.
 *
 * @template T
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const optional = (decoder) => new Optional(decoder)

/*::
export type Record<a> = Decoder<mixed, Object | $ObjMap<a, <b>(Decoder<mixed, b>) => b>>
export type Fields<a> = {[string]:Decoder<mixed, mixed>} & $ObjMap<a, <b>(b) => Decoder<mixed, b>>
*/

class FieldError extends DecodeError {
  /**
   * @param {string} field
   * @param {Error} error
   */
  constructor(field, error) {
    super()
    this.field = field
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }
  /**
   * @param {string} context
   * @returns {string}
   */
  describe(context) {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}["${this.field}"]`)
  }
}

/**
 * @template T
 * @template {string} Name
 * @implements {Decoder.Decoder<any, T>}
 */
class FieldDecoder {
  /**
   * @param {Name} name
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(name, decoder) {
    this.name = name
    this.decoder = decoder
  }
  /**
   * @param {any} input
   */
  decode(input) {
    const { name, decoder } = this
    switch (typeof input) {
      case "function":
      case "object": {
        if (input === null) {
          break
        } else {
          try {
            const field = input[name]
            const value = decoder.decode(field)
            if (value instanceof Error) {
              if (name in input) {
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

/**
 * Decodes field with a given `name` with a given `decoder`.
 *
 * @template T
 * @template {string} Name
 * @param {Name} name
 * @param {Decoder.Decoder<any, T>} decoder
 * @returns {Decoder.Decoder<any, T>}
 */
export const field = (name, decoder) => new FieldDecoder(name, decoder)

/**
 * Decodes deeply nested field under the given `path` with a given
 * `decoder`.
 *
 * @template Out
 * @template {string[]} Path
 * @param {Path} path
 * @param {Decoder.Decoder<any, Out>} decoder
 */
export const at = (path, decoder) =>
  path.reduceRight((decoder, name) => field(name, decoder), decoder)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class RecordDecoder {
  /**
   * @param {{[Key in keyof T]: Decoder<any, T[Key]>}} fields
   */
  constructor(fields) {
    this.fields = fields
  }
  /**
   * @param {any} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) /*: Decode<a>*/ {
    const { fields } = this
    if (typeof input === "object" && input !== null) {
      /** @type {Record<any, any>} */
      const result = {}
      for (const [key, decoder] of Object.entries(fields)) {
        try {
          const value = decoder.decode(input[key])
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

/**
 * @template T
 * @param {{[Key in keyof T]: Decoder.Decoder<any, T[Key]>}} fields
 * @returns {Decoder.Decoder<any, T>}
 */
export const record = (fields) => new RecordDecoder(fields)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Form {
  /**
   * @param {{[Key in keyof T]: Decoder<any, T[Key]>}} fields
   */
  constructor(fields) {
    this.fields = fields
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) {
    const { fields } = this
    /** @type {Record<any, any>} */
    const result = {}
    for (const [key, decoder] of Object.entries(fields)) {
      const value = decoder.decode(input)
      if (value instanceof Error) {
        return value
      } else {
        result[key] = value
      }
    }

    return result
  }
}

/**
 * @template T
 * @param {{[Key in keyof T]: Decoder.Decoder<any, T[Key]>}} fields
 * @returns {Decoder.Decoder<any, T>}
 */
export const form = (fields) => new Form(fields)

class IndexError extends DecodeError {
  /**
   * @param {number} index
   * @param {Error} error
   */
  constructor(index, error) {
    super()
    this.index = index
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }

  /**
   * @param {string} context
   */
  describe(context) {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}[${this.index}]`)
  }
}

/**
 * @template T
 * @template {number} Index
 * @implements {Decoder.Decoder<any, T>}
 */
class ElementDecoder {
  /**
   *
   * @param {Index} index
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(index, decoder) {
    this.index = index
    this.decoder = decoder
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) {
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

/**
 * @template T
 * @template {number} Index
 * @param {Index} index
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const index = (index, decoder) => new ElementDecoder(index, decoder)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T[]>}
 */
class ArrayDecoder {
  /**
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(decoder) {
    this.decoder = decoder
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<T[]>}
   */
  decode(input) {
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

/**
 * @template T
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const array = (decoder) => new ArrayDecoder(decoder)

export class AccessorError extends DecodeError {
  /**
   * @param {string} accessor
   * @param {Error} error
   */
  constructor(accessor, error) {
    super()
    this.accessor = accessor
    this.problem = error instanceof DecodeError ? error : new ThrownError(error)
  }
  /**
   * @param {string} context
   */
  describe(context) {
    const where = context === "" ? "input" : context
    return this.problem.describe(`${where}["${this.accessor}"]()`)
  }
}

/**
 * @template T
 * @template {string} Name
 * @implements {Decoder.Decoder<any, T>}
 */
class AccessorDecoder {
  /**
   * @param {Name} name
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(name, decoder) {
    this.name = name
    this.decoder = decoder
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) {
    const { name, decoder } = this
    if (typeof input === "object" && input != null && name in input) {
      const object = input
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

/**
 * Creates an accessor decoder, that is it can decode result of the accessor
 * (a method on the object that takes no arguments) with given `name` and
 * `decoder.
 *
 * ```js
 * // Defining a decoder for `element.getClientRects()`
 * const rect = Decoder.record({
 *   x: Decoder.Integer,
 *   y: Decoder.Integer,
 *   width: Decoder.Integer,
 *   height: Decoder.Integer
 * })
 *
 * const clientRects = Decoder.accessor('getClientRects', Decoder.array(rect))
 * ```
 *
 * @template T
 * @template {string} Name
 * @param {Name} name
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const accessor = (name, decoder) => new AccessorDecoder(name, decoder)

/**
 * @template T
 * @implements {Decoder.Decoder<any, {[key: string]: T}>}
 */
class DictionaryDecoder {
  /**
   * @param {Decoder.Decoder<any, T>} decoder
   */
  constructor(decoder) {
    this.decoder = decoder
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<{[key:string]: T}>}
   */
  decode(input) {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return new ValueError("object", input)
    } else {
      const { decoder } = this
      const dictionary = Object.create(null)
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

/**
 * @template T
 * @param {Decoder.Decoder<any, T>} decoder
 */
export const dictionary = (decoder) => new DictionaryDecoder(decoder)

class EitherError extends DecodeError {
  /**
   * @param {DecodeError[]} problems
   */
  constructor(problems) {
    super()
    this.problems = problems
  }
  /**
   * @param {string} context
   */
  describe(context) {
    const { problems } = this
    const descriptions = problems
      .map((problem) => problem.describe(context))
      .join("\n")
    const where = this.where(context)

    return `Ran into the following problems${where}:\n\n${descriptions}`
  }
}

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Either {
  /**
   * @param {Decoder.Decoder<any, T>[]} decoders
   */
  constructor(decoders) {
    this.either = decoders
  }
  /**
   *
   * @param {any} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) {
    const { either } = this
    let problems = null
    for (const decoder of either) {
      const value = decoder.decode(input)
      if (value instanceof DecodeError) {
        problems = problems == null ? [value] : (problems.push(value), problems)
      } else {
        return value
      }
    }

    return new EitherError(problems || [])
  }
}

/**
 * @template T
 * @param {Decoder.Decoder<any, T>[]} decoders
 * @returns {Decoder.Decoder<any, T>}
 */
export const either = (decoders) => new Either(decoders)

/**
 * @template T, U
 * @param {Decoder.Decoder<any, T>} left
 * @param {Decoder.Decoder<any, U>} right
 * @returns {Decoder.Decoder<any, T|U>}
 */
export const or = (left, right) =>
  new Either([/** @type {Decoder.Decoder<any, T|U>} */ (left), right])

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Ok {
  /**
   * @param {T} value
   */
  constructor(value) {
    this.value = value
  }
  /**
   * @param {any} _input
   * @returns {Decoder.Decode<T>}
   */
  decode(_input) {
    return this.value
  }
}

/**
 * @template T
 * @param {T} value
 * @returns {Decoder.Decoder<any, T>}
 */
export const ok = (value) => new Ok(value)

/**
 * @param {string} reason
 * @returns {Decoder.Decoder<any, never>}
 */
export const error = (reason) => new DecodeError(reason)

/**
 * @template T, U
 * @implements {Decoder.Decoder<any, U>}
 */
class And {
  /**
   * @param {Decoder.Decoder<any, T>} left
   * @param {Decoder.Decoder<any, U>} right
   */
  constructor(left, right) {
    this.left = left
    this.right = right
  }

  /**
   * @param {any} input
   * @returns {Decoder.Decode<U>}
   */
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

/**
 * @template T, U
 * @param {Decoder.Decoder<any, T>} left
 * @param {Decoder.Decoder<any, U>} right
 */
export const and = (left, right) => new And(left, right)

/**
 * @template T
 * @implements {Decoder.Decoder<any, T>}
 */
class Match {
  /**
   * @param {T} expect
   */
  constructor(expect) {
    this.expect = expect
  }
  /**
   * @param {T} input
   * @returns {Decoder.Decode<T>}
   */
  decode(input) {
    const { expect } = this
    if (matches(input, expect)) {
      return expect
    } else {
      return new MissmatchError(input, expect)
    }
  }
}

/**
 * @template T
 * @param {T} actual
 * @param {T} expected
 * @returns {boolean}
 */
const matches = (actual, expected) => {
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

/**
 * @template T
 * @param {T} value
 * @returns {Decoder.Decoder<any, T>}
 */
export const match = (value) => new Match(value)

/**
 * @template {string|number|boolean|null|undefined} T
 * @param {T} value
 * @returns {Decoder.Decoder<any, T>}
 */
export const the = (value) => new Match(value)
