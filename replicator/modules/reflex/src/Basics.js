/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export const identity = value => value

/**
 * @template T
 * @param {T} value
 * @returns {() => T}
 */
export const always = value => () => value

export const True = always(/** @type {true}*/ true)
export const False = always(/** @type {false}*/ false)
export const Null = always(null)
export const Void = always(/** @type {undefined} */ undefined)
export const EmptyString = always(/** @type {""} */ "")
export const EmptyObject = always(Object.freeze({}))
/** @type {readonly any[]} */
const anyArray = Object.freeze(/** @type {any[]}*/ [])
export const EmptyArray /*: <$, a>($) => a[] */ = always(anyArray)

/** @type {Record<any, any>} */
const table = Object.freeze(Object.create(null))
export const EmptyTable = always(table)

/**
 * @param {never} value
 * @returns {any}
 */
export const unreachable = value => {
  console.error(`value passed to never`, value)
  throw TypeError(
    `unreachable was supposed to be unreachable but it was called with ${value}`
  )
}

/**
 * @template T
 * @param {T} [value]
 */
export const nothing = value => void value

const defaultReason =
  "Typesystem established invariant was broken at runtime, likely due to incorrect call from untyped JS."

/**
 * @param {Error} reason
 * @returns {never}
 */
export const panic = /*:: <error> */(reason = new Error(defaultReason)) => {
  throw reason
}
