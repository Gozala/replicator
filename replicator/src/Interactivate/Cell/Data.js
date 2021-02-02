/**
 * @typedef {{id: string, input: string, output: any}} Model
 *
 * @param {string} id
 * @param {string} input
 * @param {any} [output]
 * @returns {Model}
 */
export const init = (id, input, output = undefined) => ({
  id,
  input,
  output,
})

/**
 *
 * @param {string} id
 * @param {Model} state
 * @returns {Model}
 */
export const updateID = (id, state) => ({
  ...state,
  id,
})

/**
 *
 * @param {string} input
 * @param {Model} state
 * @returns {Model}
 */
export const updateInput = (input, state) => ({
  ...state,
  input,
})

/**
 *
 * @param {any} output
 * @param {Model} state
 * @returns {Model}
 */
export const updateOutput = (output, state) => ({
  ...state,
  output,
})

/**
 *
 * @param {Model} state
 * @returns {string}
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
