// @flow strict

/**
 * @template T
 * @typedef {ReadonlyArray<T>} ImmutableArray<T>
 */

const emptyArray /*:any[]*/ = Object.freeze([])

export const empty = /*::<a>*/ () /*:ImmutableArray<a>*/ => emptyArray

export const push = /*::<a>*/ (
  item /*:a*/,
  items /*:Iterable<a>*/
) /*:ImmutableArray<a>*/ => [...items, item]

export const append = /*::<a>*/ (
  left /*:Iterable<a>*/,
  right /*:Iterable<a>*/
) /*:ImmutableArray<a>*/ => [...left, ...right]

export const set = /*::<a>*/ (
  index /*:number*/,
  item /*:a*/,
  items /*:ImmutableArray<a>*/
) /*:ImmutableArray<a>*/ => {
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

export const slice = /*::<a>*/ (
  from /*: number*/,
  to /*: number*/,
  items /*: ImmutableArray<a>*/
) /*:ImmutableArray<a>*/ => {
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

const splice = /*::<a>*/ (
  index /*:number*/,
  n /*:number*/,
  items /*:ImmutableArray<a>*/
) /*: ImmutableArray<a>*/ => {
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

export const removePreceeding = /*::<a>*/ (
  index /*: number*/,
  n /*: number*/,
  items /*: ImmutableArray<a>*/
) /*: ImmutableArray<a>*/ => {
  const position = index - n
  const offset = position < 0 ? 0 - position : 0

  return splice(position + offset, n - offset, items)
}

export const removeFollowing = /*::<a>*/ (
  index /*: number*/,
  n /*: number*/,
  items /*: ImmutableArray<a>*/
) /*: ImmutableArray<a>*/ => {
  const offset = index < 0 ? 0 - index : 0
  return splice(index + offset, n - offset, items)
}

export const remove = /*::<a>*/ (
  index /*: number*/,
  n /*: number*/,
  items /*: ImmutableArray<a>*/
) /*: ImmutableArray<a>*/ => {
  if (n > 0) {
    return removeFollowing(index, n, items)
  } else if (n < 0) {
    return removePreceeding(index, 0 - n, items)
  } else {
    return items
  }
}

const resolve = (min /*:number*/, max /*:number*/, n /*:number*/) =>
  // Resolves index with in the given `min ... max` range.
  // negative `n` is treated as `max - n`.

  n < 0 ? clip(min, max, max + n) : clip(min, max, n)

const clip = (min /*:number*/, max /*:number*/, n /*:number*/) =>
  // Clips given `n` to a range of `min ... max` range.
  n < min ? min : n > max ? max : n
