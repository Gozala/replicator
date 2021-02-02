// @flow strict

import * as Cell from "../Cell/Data.js"
import * as SelectionMap from "../../../modules/Data/SelectionMap.js"

/**
 * @typedef {SelectionMap.ID} ID
 * @typedef {{
 *  url: ?URL
 *  isOwner: boolean
 *  nextID: number
 *  status: "loading"|"ready"|"error";
 *  cells: SelectionMap.SelectionMap<Cell.Model>
 * }} Model
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

export const init = (
  url /*:?URL*/,
  isOwner /*:boolean*/,
  input /*:string*/
) /*:Model*/ => {
  const cells = []
  let n = 0
  let baseURL = url ? `${url.href}#` : "#"
  const chunks = Cell.tokenize(input)
  const tokens = chunks.length === 0 ? [input] : chunks
  for (const token of tokens) {
    cells.push(Cell.init(`${baseURL}${++n}`, token))
  }

  const [cell] = cells
  return notebook(
    url,
    isOwner,
    ++n,
    "ready",
    SelectionMap.select(cell, SelectionMap.fromValues(cells))
  )
}

export const load = (url /*:URL*/) /*:Model*/ =>
  notebook(url, false, 0, "loading")

export const updateURL = (
  url /*:URL*/,
  isOwner /*:boolean*/,
  state /*:Model*/
) /*:Model*/ => ({
  ...state,
  cells: SelectionMap.map(
    (cell) =>
      Cell.updateID(`${url.href}${cell.id.substr(cell.id.indexOf("#"))}`, cell),
    state.cells
  ),
  url,
  isOwner,
})

export const failLoad = (state /*:Model*/) =>
  state.status === "loading" ? { ...state, status: "error" } : state

export const append = (
  entries /*:{input:string}[]*/,
  state /*:Model*/
) /*:Model*/ => {
  const { url, nextID } = state
  const $ = url ? `${url.href}#` : `#`
  const cells = SelectionMap.append(
    entries.map(({ input }, n) => Cell.init(`${$}${nextID + n + 1}`, input)),
    state.cells
  )

  return { ...state, cells, nextID: nextID + entries.length }
}

export const insert = (
  id /*:ID*/,
  dir /*:1|-1*/,
  entries /*:{input:string}[]*/,
  state /*:Model*/
) /*:Model*/ => {
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

export const removeCells = (ids /*:ID[]*/, state /*:Model*/) /*:Model*/ => {
  const cells = SelectionMap.remove(ids, state.cells)
  return { ...state, cells }
}

export const replaceCell = (
  id /*:ID*/,
  cell /*:Cell.Model*/,
  state /*:Model*/
) => ({
  ...state,
  cells: SelectionMap.replaceWith(
    id,
    (maybeCell) => (maybeCell ? cell : null),
    state.cells
  ),
})

export const joinCell = (id /*:ID*/, dir /*:-1|1*/, state /*:Model*/) => {
  const cells = SelectionMap.join(
    (left, right) =>
      Cell.init(left.id, `${left.input}\n${right.input}`, right.output),
    id,
    dir,
    state.cells
  )
  return { ...state, cells }
}

export const cellByID = (id /*:ID*/, state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByKey(id, state.cells)

export const cells = (
  state /*:Model*/
) /*:Array<[ID, Cell.Model, boolean]>*/ => [
  ...SelectionMap.entries(state.cells),
]

export const changeCellSelection = (
  offset /*:number*/,
  loop /*:boolean*/,
  state /*:Model*/
) => ({
  ...state,
  cells: SelectionMap.selectByOffset(offset, loop, state.cells),
})

export const selectByID = (id /*:ID*/, state /*:Model*/) => ({
  ...state,
  cells: SelectionMap.selectByKey(id, state.cells),
})

export const selectedCellID = (state /*:Model*/) /*:?ID*/ =>
  SelectionMap.selectedKey(state.cells)

export const selectedCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.selectedValue(state.cells)

export const selection = (state /*:Model*/) /*:?[ID, Cell.Model]*/ =>
  SelectionMap.selectedEntry(state.cells)

export const lastCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByIndex(-1, state.cells)

export const firstCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByIndex(0, state.cells)

export const firstID = (state /*:Model*/) /*:?ID*/ =>
  SelectionMap.keyByIndex(0, state.cells)

export const lastID = (state /*:Model*/) /*:?ID*/ =>
  SelectionMap.keyByIndex(-1, state.cells)

export const textInput = (state /*:Model*/) /*:string*/ => {
  const chunks = []
  for (const value of SelectionMap.values(state.cells)) {
    chunks.push(Cell.input(value))
  }
  return chunks.join("\n\n")
}

export const idByOffset = (
  offset /*:number*/,
  id /*:ID*/,
  state /*:Model*/
) /*:?ID*/ => SelectionMap.keyByOffset(offset, id, state.cells)
