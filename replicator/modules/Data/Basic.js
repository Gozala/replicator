/**
 * @typedef {string|number|boolean|null|undefined|symbol} Primitive
 */
/**
 * Utility function that can be used to retain literal type of the
 * value in typescript. E.g. `the("foo")` will have type of `"foo"`
 * as opposed to `string` which you'd get if you'd just typed `"foo"`.
 *
 * @example
 * ```js
 * const message = {
 *   tag: the("ping")
 *   time: Date.now()
 * } // inferred as { tag: "ping", time: number }
 * ```
 *
 * @template {Primitive} T
 * @param {T} value
 * @returns {T}
 */
export const the = (value) => value
