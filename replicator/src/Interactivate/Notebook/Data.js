import * as Notebook from "./Notebook.js"
import * as Cell from "../Cell/Data.js"
import * as SelectionMap from "../../../modules/Data/SelectionMap.js"

/**
 * @param {URL|null} url
 * @param {boolean} isOwner
 * @param {number} nextID
 * @param {Notebook.Status} status
 * @param {Notebook.Cells} cells
 * @returns {Notebook.Model}
 */
const notebook = (
  url,
  isOwner,
  nextID,
  status,
  cells = SelectionMap.empty()
) => ({
  url,
  isOwner,
  nextID,
  status,
  cells,
})

/**
 *
 * @param {URL|null} url
 * @param {boolean} isOwner
 * @param {string} input
 * @returns {Notebook.Model}
 */
export const init = (url, isOwner, input) => {
  const cells = []
  let n = 0
  let baseURL = url ? `${url.href}#` : "#"
  const chunks = Cell.tokenize(input)
  const tokens = chunks.length === 0 ? [input] : chunks
  for (const token of tokens) {
    cells.push(Cell.init(`${baseURL}${++n}`, token))
  }

  const cell = /** @type {Notebook.Cell.Model} */ (cells[0])
  return notebook(
    url,
    isOwner,
    ++n,
    "ready",
    SelectionMap.select(cell, SelectionMap.fromValues(cells))
  )
}

/**
 * @param {URL} url
 * @returns {Notebook.Model}
 */
export const load = (url) => notebook(url, false, 0, "loading")

/**
 * @param {URL} url
 * @param {boolean} isOwner
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const updateURL = (url, isOwner, state) => ({
  ...state,
  cells: SelectionMap.map(
    (cell) =>
      Cell.updateID(`${url.href}${cell.id.substr(cell.id.indexOf("#"))}`, cell),
    state.cells
  ),
  url,
  isOwner,
})

/**
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const failLoad = (state) =>
  state.status === "loading" ? { ...state, status: "error" } : state

/**
 *
 * @param {{input:string}[]} entries
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const append = (entries, state) => {
  const { url, nextID } = state
  const $ = url ? `${url.href}#` : `#`
  const cells = SelectionMap.append(
    entries.map(({ input }, n) => Cell.init(`${$}${nextID + n + 1}`, input)),
    state.cells
  )

  return { ...state, cells, nextID: nextID + entries.length }
}

/**
 * @param {Notebook.ID} id
 * @param {Notebook.Cell.Direction} dir
 * @param {{input:string}[]} entries
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const insert = (id, dir, entries, state) => {
  const { url, nextID } = state
  const $ = url ? `${url.href}#` : `#`

  const cells = SelectionMap.insert(
    id,
    dir,
    entries.map(({ input }, n) => Cell.init(`${$}${nextID + n + 1}`, input)),
    state.cells
  )

  return { ...state, cells, nextID: nextID + entries.length }
}

/**
 * @param {Notebook.ID[]} ids
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const removeCells = (ids, state) => {
  const cells = SelectionMap.remove(ids, state.cells)
  return { ...state, cells }
}

/**
 *
 * @param {Notebook.ID} id
 * @param {Notebook.Cell.Model} cell
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const replaceCell = (id, cell, state) => ({
  ...state,
  cells: SelectionMap.replaceWith(
    id,
    (maybeCell) => (maybeCell ? cell : null),
    state.cells
  ),
})

/**
 * @param {Notebook.ID} id
 * @param {Notebook.Direction} dir
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const joinCell = (id, dir, state) => {
  const cells = SelectionMap.join(
    (left, right) =>
      Cell.init(left.id, `${left.input}\n${right.input}`, right.output),
    id,
    dir,
    state.cells
  )
  return { ...state, cells }
}

/**
 * @param {Notebook.ID} id
 * @param {Notebook.Model} state
 * @returns {Notebook.Cell.Model|null}
 */
export const cellByID = (id, state) => SelectionMap.valueByKey(id, state.cells)

/**
 * @param {Notebook.Model} state
 */
export const cells = (state /*:Model*/) => [
  ...SelectionMap.entries(state.cells),
]

/**
 *
 * @param {number} offset
 * @param {boolean} loop
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const changeCellSelection = (offset, loop, state) => ({
  ...state,
  cells: SelectionMap.selectByOffset(offset, loop, state.cells),
})

/**
 * @param {Notebook.ID} id
 * @param {Notebook.Model} state
 * @returns {Notebook.Model}
 */
export const selectByID = (id, state) => ({
  ...state,
  cells: SelectionMap.selectByKey(id, state.cells),
})

/**
 * @param {Notebook.Model} state
 */
export const selectedCellID = (state) => SelectionMap.selectedKey(state.cells)

/**
 * @param {Notebook.Model} state
 */
export const selectedCell = (state) => SelectionMap.selectedValue(state.cells)

/**
 * @param {Notebook.Model} state
 */
export const selection = (state) => SelectionMap.selectedEntry(state.cells)

/**
 * @param {Notebook.Model} state
 */
export const lastCell = (state) => SelectionMap.valueByIndex(-1, state.cells)

/**
 * @param {Notebook.Model} state
 */
export const firstCell = (state) => SelectionMap.valueByIndex(0, state.cells)

/**
 * @param {Notebook.Model} state
 */
export const firstID = (state) => SelectionMap.keyByIndex(0, state.cells)

/**
 * @param {Notebook.Model} state
 */
export const lastID = (state) => SelectionMap.keyByIndex(-1, state.cells)

/**
 * @param {Notebook.Model} state
 */
export const textInput = (state) => {
  const chunks = []
  for (const value of SelectionMap.values(state.cells)) {
    chunks.push(Cell.input(value))
  }
  return chunks.join("\n\n")
}

/**
 *
 * @param {number} offset
 * @param {Notebook.ID} id
 * @param {Notebook.Model} state
 */
export const idByOffset = (offset, id, state) =>
  SelectionMap.keyByOffset(offset, id, state.cells)

/**
 * Attempts to figures out CID from the the given URL. Returns either CID
 * (in string representation) or null.
 *
 * @expample
 * ```js
 * deriveCID(new URL(http://bafybeigizayotjo4whdurcq6ge7nrgfyxox7ji7oviesmnvgrnxn3nakni.ipfs.localhost:5000/))
 * //> "bafybeigizayotjo4whdurcq6ge7nrgfyxox7ji7oviesmnvgrnxn3nakni"
 * deriveCID(new URL('https://ipfs.io/ipfs/QmbrRJJNKmPDUAZ8CGwn1WNx2C7xP4J284VWoAUDaCiLaD'))
 * //> "QmbrRJJNKmPDUAZ8CGwn1WNx2C7xP4J284VWoAUDaCiLaD"
 * ```
 * @param {URL} url
 * @returns {string|null}
 */
export const deriveCID = (url) =>
  deriveCIDFromHostname(url.hostname) || deriveCIDFromPath(url.pathname)

/**
 * @param {string} hostname
 * @returns {string|null}
 */
const deriveCIDFromHostname = (hostname) => {
  const index = hostname.indexOf(".ipfs.")
  if (index > 0) {
    return hostname.slice(0, index)
  }
  return null
}

/**
 * @param {string} path
 * @returns {string|null}
 */
const deriveCIDFromPath = (path) => {
  if (path.startsWith("/ipfs/")) {
    const start = "/ipfs/".length
    const end = path.indexOf("/", start)
    return path.slice(start, end > 0 ? end : path.length)
  }
  return null
}
