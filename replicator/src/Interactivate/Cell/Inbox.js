/**
 * @typedef {-1|1} Direction
 *
 * @typedef {never
 * | { tag:"change", value:string }
 * | { tag:"leave", value:Direction }
 * | { tag:"remove", value:Direction }
 * | { tag:"split" }
 * | { tag:"focus" }
 * | { tag:"output", value:unknown }
 * | { tag:"insert", value:{input:string}[] }
 * | { tag:"execute" }
 * | { tag:"join", value:Direction}
 * | { tag:"print" }
 * } Message
 */

/**
 *
 * @param {string} value
 * @returns {Message}
 */
export const change = (value) => ({
  tag: "change",
  value,
})

/**
 *
 * @param {unknown} value
 * @returns {Message}
 */
export const output = (value) => ({
  tag: "output",
  value,
})

/**
 *
 * @param {Direction} dir
 * @returns {Message}
 */
export const join = (dir) => ({
  tag: "join",
  value: dir,
})

/**
 *
 * @param {{input:string}[]} entries
 * @returns {Message}
 */
export const insert = (entries) => ({
  tag: "insert",
  value: entries,
})

/**
 * @returns {Message}
 */
export const print = () => ({ tag: "print" })

/**
 * @returns {Message}
 */
export const execute = () => ({ tag: "execute" })
