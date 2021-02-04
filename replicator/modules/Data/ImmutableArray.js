// @flow strict

/**
 * @template T
 * @typedef {ReadonlyArray<T>} ImmutableArray<T>
 */

/** @type {ImmutableArray<any>} */
const emptyArray = Object.freeze([])

/**
 * @template T
 * @returns {ImmutableArray<T>}
 */
export const empty = () => emptyArray

/**
 * @template T
 * @param {T} item
 * @param {Iterable<T>} items
 * @returns {ImmutableArray<T>}
 */
export const push = (item, items) => [...items, item]

/**
 * @template T
 * @param {Iterable<T>} left
 * @param {Iterable<T>} right
 * @returns {ImmutableArray<T>}
 */
export const append = (left, right) => [...left, ...right]

/**
 * @template T
 * @param {number} index
 * @param {T} item
 * @param {ImmutableArray<T>|T[]} items
 * @returns {ImmutableArray<T>}
 */
export const set = (index, item, items) => {
  const { length } = items
  const position = index < 0 ? length + index : index

  if (position < 0 || position >= length) {
    return items
  } else if (items[position] === item) {
    return items
  } else {
    const output = items.slice(0)
    output[position] = item
    return output
  }
}

/**
 * @template T
 * @param {number} from
 * @param {number} to
 * @param {ImmutableArray<T>} items
 * @returns {ImmutableArray<T>}
 */
export const slice = (from, to, items) => {
  const { length } = items
  const start = resolve(0, length, from)
  const end = resolve(0, length, to)
  if (start === 0 && end === length) {
    return items
  } else if (start >= end) {
    return emptyArray
  } else {
    return items.slice(start, end)
  }
}

/**
 * Equivalent of `array.splice` but it does not mutate passed array.
 *
 * @template T
 * @param {number} index
 * @param {number} n
 * @param {ImmutableArray<T>} items
 * @returns {ImmutableArray<T>}
 */
const splice = (index, n, items) => {
  const { length } = items
  if (length === 0) {
    return items
  } else if (index >= length) {
    return items
  } else if (n <= 0) {
    return items
  } else if (index === 0) {
    if (n < length) {
      return items.slice(n)
    } else {
      return emptyArray
    }
  } else {
    const output = items.slice(0)
    output.splice(index, n)
    return output
  }
}

/**
 * Removes `n` (or less if there aren't enough) items that preceed given
 * `index`.
 *
 * @template T
 * @param {number} index
 * @param {number} n
 * @param {ImmutableArray<T>} items
 * @returns {ImmutableArray<T>}
 */
export const removePreceeding = (index, n, items) => {
  const position = index - n
  const offset = position < 0 ? 0 - position : 0

  return splice(position + offset, n - offset, items)
}

/**
 * Removes `n` (or less if there aren't enough) items that follow given
 * `index`.
 *
 * @template T
 * @param {number} index
 * @param {number} n
 * @param {ImmutableArray<T>} items
 * @returns {ImmutableArray<T>}
 */
export const removeFollowing = (index, n, items) => {
  const offset = index < 0 ? 0 - index : 0
  return splice(index + offset, n - offset, items)
}

/**
 * Removes `n` elements form the given array from the given `index`. If
 * `n` is negative removes `-n` elements preceeding given `index`, otherwise
 * `n` elements following `index`. If there are less than `n` elements to remove
 * removes all that are.
 *
 * @template T
 * @param {number} index
 * @param {number} n
 * @param {ImmutableArray<T>} items
 * @returns {ImmutableArray<T>}
 */
export const remove = (index, n, items) => {
  if (n > 0) {
    return removeFollowing(index, n, items)
  } else if (n < 0) {
    return removePreceeding(index, 0 - n, items)
  } else {
    return items
  }
}

/**
 * Resolves index with in the given `min ... max` range. Negative `n` is
 * treated as `max - n`.
 *
 * @param {number} min
 * @param {number} max
 * @param {number} n
 * @returns {number}
 */
const resolve = (min /*:number*/, max /*:number*/, n /*:number*/) =>
  n < 0 ? clip(min, max, max + n) : clip(min, max, n)

/**
 * Clips given `n` to a range of `min ... max` range.
 *
 * @param {number} min
 * @param {number} max
 * @param {number} n
 * @returns
 */
const clip = (min /*:number*/, max /*:number*/, n /*:number*/) =>
  n < min ? min : n > max ? max : n
