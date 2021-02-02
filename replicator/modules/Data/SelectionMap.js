// @flow strict

import * as Dict from "./Dictionary.js"
import * as ImmutableArray from "./ImmutableArray.js"

/**
 * @typedef {string} ID
 */

/**
 * @template T
 * @typedef {{
 *   nextID: number,
 *   index: ImmutableArray.ImmutableArray<ID>,
 *   values: Dict.Dictionary<T>,
 *   selectionIndex: number
 * }} SelectionMap
 */

/**
 * @template T
 * @typedef {{
 *   nextID: number
 *   index: ID[]
 *   values: Dict.Dictionary<T>
 *   selectionIndex: number
 * }} Mutable
 */

const mutable = /*::<a>*/ () /*:Mutable<a>*/ => ({
  nextID: 0,
  index: [],
  values: Dict.empty(),
  selectionIndex: -1,
})

export const empty = /*::<a>*/ () /*:SelectionMap<a>*/ => mutable()

const pairs = /*::<a, b>*/ () /*:Array<[a, b]>*/ => []

export const fromValues = /*::<a>*/ (
  values /*:Iterable<a>*/
) /*:SelectionMap<a>*/ => {
  let nextID = 0
  const entries = pairs()
  const index = []
  for (const value of values) {
    const id = `${nextID++}`
    index.push(id)
    entries.push([id, value])
  }

  return { nextID, index, values: Dict.from(entries), selectionIndex: -1 }
}

export const append = /*::<a>*/ (
  items /*:a[]*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let { nextID, selectionIndex } = data
  let index = [...data.index]
  let entries = pairs()
  for (const item of items) {
    let id = `${nextID++}`
    index.push(id)
    entries.push([id, item])
  }

  const values = Dict.insertBatch(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

export const insert = /*::<a>*/ (
  key /*:ID*/,
  dir /*:-1|1*/,
  items /*:a[]*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let { nextID, selectionIndex } = data
  const index = [...data.index]
  let offset = Math.min(Math.max(0, index.indexOf(key) + 1), index.length)
  const entries = pairs()
  for (const item of items) {
    const id = `${nextID++}`
    index.splice(offset++, 0, id)
    entries.push([id, item])
  }
  const values = Dict.insertBatch(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

export const remove = /*::<a>*/ (
  ids /*:ID[]*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const index = data.index.slice()
  let { selectionIndex } = data
  for (const id of ids) {
    const offset = index.indexOf(id)
    if (offset === selectionIndex) {
      selectionIndex = -1
    }
    index.splice(offset, 1)
  }
  const keys /*:string[]*/ = ids
  const values = Dict.removeBatch(keys, data.values)

  return { ...data, index, values }
}

export const selectedKey = /*::<a>*/ (data /*:SelectionMap<a>*/) /*:?ID*/ =>
  data.index[data.selectionIndex]

export const selectedValue = /*::<a>*/ (data /*:SelectionMap<a>*/) /*:?a*/ => {
  const id = selectedKey(data)
  return id != null ? Dict.get(id, data.values) : null
}

export const keyByIndex = /*::<a>*/ (
  n /*:number*/,
  data /*:SelectionMap<a>*/
) /*:?ID*/ => {
  const { index } = data
  const offset = n < 0 ? index.length + n : n
  return index[offset]
}

export const valueByIndex = /*::<a>*/ (
  n /*:number*/,
  data /*:SelectionMap<a>*/
) /*:?a*/ => {
  const { index, values } = data
  const offset = n < 0 ? index.length + n : n
  const id = index[offset]
  if (id != null) {
    return Dict.get(id, data.values)
  } else {
    return null
  }
}

export const valueByKey = /*::<a>*/ (
  key /*:ID*/,
  data /*:SelectionMap<a>*/
) /*:?a*/ => Dict.get(key, data.values)

export const selectedEntry = /*::<a>*/ (
  data /*:SelectionMap<a>*/
) /*:?[ID, a]*/ => {
  const id = selectedKey(data)
  if (id == null) {
    return null
  } else {
    const value = selectedValue(data)
    return value != null ? [id, value] : null
  }
}

export const deselect = /*::<a>*/ (
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => ({ ...data, selectionIndex: -1 })

export const select = /*::<a>*/ (
  value /*:a*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => selectBy(($) => $ === value, data)

export const selectBy = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const { nextID, index, values } = data
  const id = Dict.findKey(predicate, values)
  const selectionIndex = id == null ? -1 : index.indexOf(id)

  if (selectionIndex !== data.selectionIndex) {
    return { ...data, selectionIndex }
  } else {
    return data
  }
}

export const selectByKey = /*::<a>*/ (
  key /*:ID*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const selectionIndex = data.index.indexOf(key)
  return { ...data, selectionIndex }
}

export const keyByOffset = /*::<a>*/ (
  offset /*:number*/,
  key /*:ID*/,
  { index } /*:SelectionMap<a>*/
) /*:?ID*/ => {
  const keyIndex = index.indexOf(key)
  const targetIndex = keyIndex + offset
  if (keyIndex < 0 || targetIndex < 0 || targetIndex >= index.length) {
    return null
  } else {
    return index[targetIndex]
  }
}

export const selectByOffset = /*::<a>*/ (
  offset /*:number*/,
  loop /*:boolean*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let selectionIndex = data.selectionIndex + offset
  const count = data.index.length
  if (loop) {
    while (selectionIndex < 0) {
      selectionIndex += count
    }
    while (selectionIndex >= count) {
      selectionIndex -= count
    }
  } else {
    selectionIndex = Math.min(
      Math.max(0, selectionIndex),
      data.index.length - 1
    )
  }
  return { ...data, selectionIndex }
}

export const map = /*::<a, b>*/ (
  f /*:(a) => b*/,
  data /*:SelectionMap<a>*/
) /*: SelectionMap<b>*/ => {
  const { nextID, index, selectionIndex, values } = data
  return { nextID, index, selectionIndex, values: Dict.map(f, data.values) }
}

export const filter = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:SelectionMap<a>*/
) /*: SelectionMap<a>*/ => {
  const { nextID, index, selectionIndex, values } = data
  const nextIndex = []
  const entries = pairs()
  let nextSelectionIndex = selectionIndex
  for (const id of index) {
    const value = Dict.get(id, values)
    if (value != null && predicate(value)) {
      nextIndex.push(id)
      entries.push([id, value])
    } else if (id === nextSelectionIndex) {
      nextSelectionIndex = -1
    }
  }

  return {
    nextID,
    index: nextIndex,
    selectionIndex: nextSelectionIndex,
    values: Dict.from(entries),
  }
}

export const entries = function* entries /*::<a>*/(
  data /*:SelectionMap<a>*/
) /*: Iterable<[ID, a, boolean]>*/ {
  const { index, selectionIndex, values } = data
  let offset = 0
  for (const id of index) {
    const value = Dict.get(id, values)
    if (value != null) {
      yield [id, value, selectionIndex === offset]
    }
    offset += 1
  }
}

export const count = /*::<a>*/ (data /*:SelectionMap<a>*/) /*: number*/ =>
  data.index.length

export const keys = /*::<a>*/ (data /*:SelectionMap<a>*/) /*: Iterable<ID>*/ =>
  data.index

export const values = function* values /*::<a>*/(
  data /*:SelectionMap<a>*/
) /*: Iterable<a>*/ {
  for (const [, value] of entries(data)) {
    yield value
  }
}

export const replaceWith = /*::<a>*/ (
  key /*:ID*/,
  replace /*:?a => ?a*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const values = Dict.replaceWith(key, replace, data.values)

  return values === data.values ? data : { ...data, values }
}

export const join = /*::<a>*/ (
  join /*:(a, a) => a*/,
  key /*:ID*/,
  dir /*:-1|1*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const { index, selectionIndex, values } = data
  if (index.length <= 1) {
    return data
  } else {
    const position = index.indexOf(key)
    const [leftIndex, rightIndex] =
      dir > 0 ? [position, position + dir] : [position + dir, position]

    if (leftIndex < 0 || rightIndex > index.length) {
      return data
    } else {
      const [leftKey, rightKey] = [index[leftIndex], index[rightIndex]]
      const [left, right] = [
        Dict.get(leftKey, values),
        Dict.get(rightKey, values),
      ]
      if (left == null || right == null) {
        return data
      } else {
        const [removeIndex, removeKey, updateKey] =
          leftIndex !== selectionIndex
            ? [leftIndex, leftKey, rightKey]
            : [rightIndex, rightKey, leftKey]

        return {
          ...data,
          index: ImmutableArray.remove(removeIndex, 1, index),
          values: Dict.insert(
            updateKey,
            join(left, right),
            Dict.remove(removeKey, values)
          ),
        }
      }
    }
  }
}
