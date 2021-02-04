import * as Cell from "./Cell.js"

/**
 * @param {string} id
 * @param {string} input
 * @param {Cell.Output} [output]
 * @returns {Cell.Model}
 */
export const init = (id, input, output = undefined) => ({
  id,
  input,
  output,
})

/**
 *
 * @param {string} id
 * @param {Cell.Model} state
 * @returns {Cell.Model}
 */
export const updateID = (id, state) => ({
  ...state,
  id,
})

/**
 *
 * @param {string} input
 * @param {Cell.Model} state
 * @returns {Cell.Model}
 */
export const updateInput = (input, state) => ({
  ...state,
  input,
})

/**
 * @param {Cell.Output} output
 * @param {Cell.Model} state
 * @returns {Cell.Model}
 */
export const updateOutput = (output, state) => ({
  ...state,
  output,
})

/**
 * @param {Cell.Model} state
 */
export const input = ({ input }) => input

/**
 * @param {string} input
 * @returns {string[]}
 */
export const tokenize = (input /*:string*/) /*:string[]*/ => {
  const tokens = []
  let match = null
  let offset = 0
  while ((match = CELL_PATTERN.exec(input))) {
    const start = offset
    // @ts-ignore
    const end = match.index + match[0].length
    const token = input.slice(start, end)
    tokens.push(token.trim())
    offset = end + 1
  }

  if (offset > 0 && offset < input.length) {
    tokens.push(input.slice(offset))
  }

  return tokens
}

const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*$)/gm
