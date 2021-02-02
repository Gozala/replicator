/**
 * @typedef {string|number} Key
 */

/**
 * @template {NonNullable<any>} T
 * @typedef {Record<Key, T>} Dictionary<T>
 */

/**
 * @template {NonNullable<any>} T
 * @typedef {Record<Key, T>} Mutable<T>
 */

function Dict() {}
Object.setPrototypeOf(Dict.prototype, null)

const seed /*:Dictionary<any>*/ = new Dict()

export const empty = /*::<a>*/ () /*:Dictionary<a>*/ => seed

const mutable = /*::<a>*/ (source /*:Dictionary<a>*/) /*:Mutable<a>*/ =>
  Object.assign(new Dict(), source)

export const singleton = /*::<a>*/ (
  key /*:Key*/,
  value /*:a*/
) /*:Dictionary<a>*/ => {
  const data = new Dict()
  data[key] = value
  return data
}

export const from = /*::<a>*/ (
  entries /*:Iterable<[string, a]> | Iterable<[number, a]>*/
) /*:Dictionary<a>*/ => {
  let data
  for (const [key, value] of entries) {
    if (value != null) {
      const dict = data || (data = new Dict())
      dict[key] = value
    }
  }

  return data || seed
}

export const insert = /*::<a>*/ (
  key /*:Key*/,
  value /*:a*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<a>*/ => {
  const current = data[key]
  if (current === value) {
    return data
  } else {
    const result = mutable(data)
    result[key] = value
    return result
  }
}

export const insertBatch = /*::<a>*/ (
  entries /*:Iterable<[Key, a]>*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<a>*/ => {
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

export const map = /*::<a, $b, b:$NonMaybeType<$b>>*/ (
  f /*:a => b*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<b>*/ => {
  const result = new Dict()
  for (const key in data) {
    result[key] = f(data[key])
  }
  return result
}

export const replaceWith = /*::<a>*/ (
  key /*:Key*/,
  replace /*:?a => ?a*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<a>*/ => {
  const value = replace(data[key])
  if (value != null) {
    return insert(key, value, data)
  } else {
    return data
  }
}

export const remove = /*::<a>*/ (
  key /*:Key*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<a>*/ => {
  if (data[key] != null) {
    const dict = mutable(data)
    delete dict[key]

    // If it has more keys than we return new instance, otherwise just return
    // empty
    for (const key in dict) {
      return dict
    }

    return empty()
  } else {
    return data
  }
}

export const removeBatch = /*::<a>*/ (
  keys /*:string[] | number[]*/,
  data /*:Dictionary<a>*/
) /*:Dictionary<a>*/ => {
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
    for (const key in result) {
      return result
    }

    return empty()
  }
}

export const isEmpty = /*::<a>*/ (data /*:Dictionary<a>*/) /*:boolean*/ =>
  data === seed

export const hasKey = /*::<a>*/ (
  key /*:Key*/,
  data /*:Dictionary<a>*/
) /*:boolean*/ => key in data

export const get = /*::<a>*/ (key /*:Key*/, data /*:Dictionary<a>*/) /*:?a*/ =>
  data[key]

export const keys = /*::<a>*/ (data /*:Dictionary<a>*/) /*:Key[]*/ =>
  Object.keys(data)

export const values = /*::<a>*/ (data /*:Dictionary<a>*/) /*:a[]*/ => {
  const values /*:any*/ = Object.values(data)
  return values
}

export const entries = /*::<a>*/ (
  data /*:Dictionary<a>*/
) /*:Array<[Key, a]>*/ => {
  const entries /*:any*/ = Object.entries(data)
  return entries
}

export const findKey = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:Dictionary<a>*/
) /*:?Key*/ => {
  for (const key in data) {
    const value = data[key]
    if (predicate(value)) {
      return key
    }
  }
  return null
}

export const findEntry = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:Dictionary<a>*/
) /*:?[Key, a]*/ => {
  for (const key in data) {
    const value = data[key]
    if (predicate(value)) {
      return [key, value]
    }
  }
  return null
}
