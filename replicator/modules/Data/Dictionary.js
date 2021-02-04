/**
 * @typedef {string} Key
 */

/**
 * @template {NonNullable<any>} T
 * @typedef {Readonly<Record<Key, T>>} Dictionary<T>
 */

/**
 * @template {NonNullable<any>} T
 * @typedef {Record<Key, T>} Mutable<T>
 */

function Dict() {}
Object.setPrototypeOf(Dict.prototype, null)

/** @type {Dictionary<any>} */
const seed =
  // @ts-ignore
  new Dict()

/**
 * @template T
 * @returns {Dictionary<T>}
 */
export const empty = () => seed

/**
 * @template T
 * @param {Dictionary<T>} [source]
 * @returns {Mutable<T>}
 */
const mutable = (source) =>
  Object.assign(
    // @ts-ignore
    new Dict(),
    source
  )

/**
 * @template {NonNullable<any>} T
 * @param {Key} key
 * @param {T} value
 * @returns {Dictionary<T>}
 */
export const singleton = /*::<a>*/ (
  key /*:Key*/,
  value /*:a*/
) /*:Dictionary<a>*/ => {
  const data = mutable()
  data[key] = value
  return data
}

/**
 * @template T
 * @template {Key} K
 * @param {Iterable<[K, T]>} entries
 * @returns {Dictionary<T>}
 */
export const from = (entries) => {
  let data
  for (const [key, value] of entries) {
    if (value != null) {
      const dict = data || (data = mutable())
      dict[key] = value
    }
  }

  return data || seed
}

/**
 * Returns dictionaly just like given one execept that given `key` is mapped
 * to given `value`. If given dictionary contains equal value for the given
 * `key` same dictionary is returned. It does not matter if given dicetionary
 * contained different `value` for the given `key`.
 *
 * @template T
 * @param {Key} key
 * @param {T} value
 * @param {Dictionary<T>} data
 * @returns {Dictionary<T>}
 */
export const insert = (key, value, data) => {
  const current = data[key]
  if (current === value) {
    return data
  } else {
    const result = mutable(data)
    result[key] = value
    return result
  }
}

/**
 * @template T
 * @param {Iterable<[Key, T]>} entries
 * @param {Dictionary<T>} data
 * @returns {Dictionary<T>}
 */
export const insertAll = (entries, data) => {
  let result = null
  for (const [key, value] of entries) {
    const current = data[key]
    if (current !== value) {
      const dict = result || (result = mutable(data))
      dict[key] = value
    }
  }
  return result == null ? data : result
}

/**
 * @template T
 * @template {NonNullable<any>} U
 * @param {(value:T) => U} f
 * @param {Dictionary<T>} data
 * @returns {Dictionary<U>}
 */
export const map = (f, data) => {
  const result = mutable()
  for (const [key, value] of Object.entries(data)) {
    result[key] = f(value)
  }
  return result
}

/**
 * @template T
 * @param {Key} key
 * @param {(value?:T) => T|null|undefined} replace
 * @param {Dictionary<T>} data
 * @returns {Dictionary<T>}
 */
export const replaceWith = (key, replace, data) => {
  const value = replace(data[key])
  if (value != null) {
    return insert(key, value, data)
  } else {
    return data
  }
}

/**
 * @template T
 * @param {Key} key
 * @param {Dictionary<T>} data
 * @returns {Dictionary<T>}
 */
export const remove = /*::<a>*/ (key, data) => {
  if (data[key] != null) {
    const dict = mutable(data)
    delete dict[key]

    // If it has more keys than we return new instance, otherwise just return
    // empty
    for (const _key in dict) {
      return dict
    }

    return empty()
  } else {
    return data
  }
}

/**
 * @template T
 * @param {Key[]} keys
 * @param {Dictionary<T>} data
 * @returns {Dictionary<T>}
 */
export const removeAll = (keys, data) => {
  let result = null
  for (const key of keys) {
    if (data[key] != null) {
      const dict = result == null ? (result = mutable(data)) : result
      delete dict[key]
    } else {
      return data
    }
  }

  // If it has more keys than we return new instance, otherwise just return
  // empty
  if (result == null) {
    return data
  } else {
    for (const _key in result) {
      return result
    }

    return empty()
  }
}

/**
 * @template T
 * @param {Dictionary<T>} data
 * @returns {boolean}
 */
export const isEmpty = (data) => data === seed

/**
 * @template T
 * @param {Key} key
 * @param {Dictionary<T>} data
 * @returns {boolean}
 */
export const hasKey = (key, data) => key in data

/**
 * @template T
 * @param {Key} key
 * @param {Dictionary<T>} data
 * @returns {T|null}
 */
export const get = (key, data) => data[key] || null

/**
 * @template T
 * @param {Dictionary<T>} data
 * @returns {Key[]}
 */
export const keys = (data) => Object.keys(data)

/**
 * @template T
 * @param {Dictionary<T>} data
 * @returns {T[]}
 */
export const values = (data) => Object.values(data)

/**
 * @template T
 * @param {Dictionary<T>} data
 * @returns {Array<[Key, T]>}
 */
export const entries = (data) => Object.entries(data)

/**
 * @template T
 * @param {(value:T) => boolean} predicate
 * @param {Dictionary<T>} data
 * @returns {null|Key}
 */
export const findKey = (predicate, data) => {
  for (const [key, value] of entries(data)) {
    if (predicate(value)) {
      return key
    }
  }
  return null
}

/**
 * @template T
 * @param {(value:T) => boolean} predicate
 * @param {Dictionary<T>} data
 * @returns {null|[Key, T]}
 */
export const findEntry = (predicate, data) => {
  for (const [key, value] of entries(data)) {
    if (predicate(value)) {
      return [key, value]
    }
  }
  return null
}
