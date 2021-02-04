import * as Cell from "./Cell.js"

/**
 *
 * @param {string} value
 * @returns {Cell.Message}
 */
export const change = (value) => ({
  tag: "change",
  value,
})

/**
 *
 * @param {Cell.Output} value
 * @returns {Cell.Message}
 */
export const output = (value) => ({
  tag: "output",
  value,
})

/**
 * @param {Cell.Direction} dir
 * @returns {Cell.Message}
 */
export const join = (dir) => ({
  tag: "join",
  value: dir,
})

/**
 * @param {Cell.Input[]} entries
 * @returns {Cell.Message}
 */
export const insert = (entries) => ({
  tag: "insert",
  value: entries,
})

/**
 * @returns {Cell.Message}
 */
export const print = () => ({ tag: "print" })

/**
 * @returns {Cell.Message}
 */
export const execute = () => ({ tag: "execute" })
