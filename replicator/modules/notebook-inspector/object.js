const {
  getOwnPropertySymbols,
  getOwnPropertyDescriptor,
  getOwnPropertyNames,
  getPrototypeOf,
  prototype: {hasOwnProperty}
} = Object;
const {toStringTag} = Symbol;
export const FORBIDDEN = {};
export const symbolsof = getOwnPropertySymbols;
export const namesof = getOwnPropertyNames;
export const propertyof = getOwnPropertyDescriptor;
export function isown(object, key) {
  return hasOwnProperty.call(object, key);
}
export function tagof(object) {
  return object[toStringTag] || object.constructor && object.constructor.name || "Object";
}
export function valueof(object, key) {
  try {
    const value = object[key];
    if (value)
      value.constructor;
    return value;
  } catch (ignore) {
    return FORBIDDEN;
  }
}
export function* fieldsof(object) {
  for (const key of namesof(object)) {
    yield key;
  }
  for (const symbol of symbolsof(object)) {
    yield symbol;
  }
}
export function* gettersof(object) {
  let proto = getPrototypeOf(object);
  while (proto) {
    for (const key of fieldsof(proto)) {
      switch (key) {
        case "__proto__":
          break;
        default: {
          const property = propertyof(proto, key);
          if (property.get) {
            yield key;
          }
        }
      }
    }
    proto = getPrototypeOf(proto);
  }
}
