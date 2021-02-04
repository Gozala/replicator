import * as Dict from "./Dictionary.js"
import * as ImmutableArray from "./ImmutableArray.js"

/**
 * @typedef {string} ID
 * @typedef {-1|1} Direction
 */

/**
 * @template {NonNullable<any>} T
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

/**
 * @template T
 * @returns {Mutable<T>}
 */

const mutable = () => ({
  nextID: 0,
  index: [],
  values: Dict.empty(),
  selectionIndex: -1,
})

/**
 * @template T
 * @returns {Mutable<T>}
 */
export const empty = () => mutable()

/**
 * @template T, U
 * @returns {Array<[T, U]>}
 */
const pairs = () => []

/**
 * @template T
 * @param {Iterable<T>} values
 * @returns {SelectionMap<T>}
 */
export const fromValues = (values) => {
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

/**
 * @template T
 * @param {T[]} items
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const append = (items, data) => {
  let { nextID, selectionIndex } = data
  let index = [...data.index]
  let entries = pairs()
  for (const item of items) {
    let id = `${nextID++}`
    index.push(id)
    entries.push([id, item])
  }

  const values = Dict.insertAll(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

/**
 * @template T
 * @param {ID} key
 * @param {Direction} _dir
 * @param {T[]} items
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const insert = (key, _dir, items, data) => {
  let { nextID, selectionIndex } = data
  const index = [...data.index]
  let offset = Math.min(Math.max(0, index.indexOf(key) + 1), index.length)
  const entries = pairs()
  for (const item of items) {
    const id = `${nextID++}`
    index.splice(offset++, 0, id)
    entries.push([id, item])
  }
  const values = Dict.insertAll(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

/**
 * @template T
 * @param {ID[]} ids
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */

export const remove = (ids, data) => {
  const index = data.index.slice()
  let { selectionIndex } = data
  for (const id of ids) {
    const offset = index.indexOf(id)
    if (offset === selectionIndex) {
      selectionIndex = -1
    }
    index.splice(offset, 1)
  }
  const keys = ids
  const values = Dict.removeAll(keys, data.values)

  return { ...data, index, values }
}

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {null|ID}
 */
export const selectedKey = (data) => data.index[data.selectionIndex] || null

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {null|T}
 */
export const selectedValue = (data) => {
  const id = selectedKey(data)
  return id != null ? Dict.get(id, data.values) : null
}

/**
 * @template T
 * @param {number} n
 * @param {SelectionMap<T>} data
 * @returns {null|ID}
 */
export const keyByIndex = (n, data) => {
  const { index } = data
  const offset = n < 0 ? index.length + n : n
  return index[offset] || null
}

/**
 * @template T
 * @param {number} n
 * @param {SelectionMap<T>} data
 * @returns {null|T}
 */
export const valueByIndex = (n, data) => {
  const { index, values } = data
  const offset = n < 0 ? index.length + n : n
  const id = index[offset]
  if (id != null) {
    return Dict.get(id, values)
  } else {
    return null
  }
}

/**
 * @template T
 * @param {ID} key
 * @param {SelectionMap<T>} data
 * @returns {T|null}
 */
export const valueByKey = (key, data) => Dict.get(key, data.values)

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {[ID, T]|null}
 */
export const selectedEntry = (data) => {
  const id = selectedKey(data)
  if (id == null) {
    return null
  } else {
    const value = selectedValue(data)
    return value != null ? [id, value] : null
  }
}

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const deselect = (data) => ({ ...data, selectionIndex: -1 })

/**
 * @template T
 * @param {T} value
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const select = (value, data) => selectBy(($) => $ === value, data)

/**
 * @template T
 * @param {(value:T) => boolean} predicate
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const selectBy = (predicate, data) => {
  const { index, values } = data
  const id = Dict.findKey(predicate, values)
  const selectionIndex = id == null ? -1 : index.indexOf(id)

  if (selectionIndex !== data.selectionIndex) {
    return { ...data, selectionIndex }
  } else {
    return data
  }
}

/**
 * @template T
 * @param {ID} key
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const selectByKey = (key, data) => {
  const selectionIndex = data.index.indexOf(key)
  return { ...data, selectionIndex }
}

/**
 * @template T
 * @param {number} offset
 * @param {ID} key
 * @param {SelectionMap<T>} data
 * @returns {ID|null}
 */
export const keyByOffset = (offset, key, { index }) => {
  const keyIndex = index.indexOf(key)
  const targetIndex = keyIndex + offset
  if (keyIndex < 0 || targetIndex < 0 || targetIndex >= index.length) {
    return null
  } else {
    return index[targetIndex] || null
  }
}

/**
 * @template T
 * @param {number} offset
 * @param {boolean} loop
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const selectByOffset = (offset, loop, data) => {
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

/**
 * @template T
 * @template {NonNullable<any>} U
 * @param {(value:T) => U} f
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<U>}
 */
export const map = (f, data) => {
  const { nextID, index, selectionIndex, values } = data
  return { nextID, index, selectionIndex, values: Dict.map(f, values) }
}

/**
 * @template T
 * @param {(value:T) => boolean} predicate
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */

export const filter = (predicate, data) => {
  const { nextID, index, selectionIndex, values } = data
  const nextIndex = []
  const entries = pairs()
  let nextSelectionIndex = selectionIndex
  for (const id of index) {
    const value = Dict.get(id, values)
    if (value != null && predicate(value)) {
      nextIndex.push(id)
      entries.push([id, value])
    } else if (id === `${nextSelectionIndex}`) {
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

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {Iterable<[ID, T, boolean]>} data
 */
export const entries = function* entries(data) {
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

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {number}
 */
export const count = (data) => data.index.length

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {Iterable<ID>}
 */
export const keys = (data) => data.index

/**
 * @template T
 * @param {SelectionMap<T>} data
 * @returns {Iterable<T>}
 */
export const values = function* values(data) {
  for (const [, value] of entries(data)) {
    yield value
  }
}

/**
 * @template T
 * @param {ID} key
 * @param {(value?:T) => T|null|undefined} replace
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const replaceWith = (key, replace, data) => {
  const values = Dict.replaceWith(key, replace, data.values)

  return values === data.values ? data : { ...data, values }
}

/**
 * @template T
 * @param {(left:T, right:T) => T} join
 * @param {ID} key
 * @param {Direction} dir
 * @param {SelectionMap<T>} data
 * @returns {SelectionMap<T>}
 */
export const join = (join, key, dir, data) => {
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
      const [leftKey, rightKey] = [
        /** @type {string} */ (index[leftIndex]),
        /** @type {string} */ (index[rightIndex]),
      ]
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
