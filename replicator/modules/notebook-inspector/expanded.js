import dispatch from "./dispatch.js";
import {isarray, isindex} from "./array.js";
import inspectCollapsed from "./collapsed.js";
import formatSymbol from "./formatSymbol.js";
import {inspect, replace} from "./inspect.js";
import {
  isown,
  symbolsof,
  namesof,
  gettersof,
  fieldsof,
  tagof,
  valueof,
  propertyof,
  FORBIDDEN
} from "./object.js";
export default function inspectExpanded(object) {
  const arrayish = isarray(object);
  let tag, fields;
  if (object instanceof Map) {
    tag = `Map(${object.size})`;
    fields = iterateMap;
  } else if (object instanceof Set) {
    tag = `Set(${object.size})`;
    fields = iterateSet;
  } else if (arrayish) {
    tag = `${object.constructor.name}(${object.length})`;
    fields = iterateArray;
  } else {
    tag = tagof(object);
    fields = iterateObject;
  }
  const span = document.createElement("span");
  span.className = "observablehq--expanded";
  const a = span.appendChild(document.createElement("a"));
  a.innerHTML = `<svg width=8 height=8 class='observablehq--caret'>
    <path d='M4 7L0 1h8z' fill='currentColor' />
  </svg>`;
  a.appendChild(document.createTextNode(`${tag}${arrayish ? " [" : " {"}`));
  a.addEventListener("mouseup", function(event) {
    event.stopPropagation();
    replace(span, inspectCollapsed(object));
  });
  fields = fields(object);
  let n = 20;
  let next = {done: true};
  while (n-- > 0) {
    next = fields.next();
    if (next.done) {
      break;
    } else {
      span.appendChild(next.value);
    }
  }
  if (!next.done) {
    const {value} = next;
    const a2 = span.appendChild(document.createElement("a"));
    a2.className = "observablehq--field";
    a2.style.display = "block";
    a2.appendChild(document.createTextNode(`  \u2026 more`));
    a2.addEventListener("mouseup", function(event) {
      event.stopPropagation();
      span.insertBefore(value, a2);
      for (let i = 0; !(next = fields.next()).done && i < 19; ++i) {
        if (!next.done) {
          span.insertBefore(next.value, a2);
        }
      }
      if (next.done) {
        span.removeChild(a2);
      }
      dispatch(span, "load");
    });
  }
  span.appendChild(document.createTextNode(arrayish ? "]" : "}"));
  return span;
}
function* iterateMap(map) {
  for (const [key, value] of map) {
    yield formatMapField(key, value);
  }
  yield* iterateObject(map);
}
function* iterateSet(set) {
  for (const value of set) {
    yield formatSetField(value);
  }
  yield* iterateObject(set);
}
function* iterateArray(array) {
  for (let i = 0, n = array.length; i < n; ++i) {
    if (i in array) {
      yield formatElement(i, valueof(array, i), "observablehq--index");
    }
  }
  for (const key in fieldsof(array)) {
    if (!isindex(key)) {
      for (const field of iterateProperty(key, array)) {
        yield field;
      }
    }
  }
  for (const getter of iterateGetters(array)) {
    yield getter;
  }
}
function* iterateProperty(key, object) {
  const property = propertyof(object, key);
  const [name, className] = typeof key === "string" ? [key, "observablehq--key"] : [formatSymbol(key), "observablehq--symbol"];
  if ("value" in property) {
    yield formatField(name, valueof(property, "value"), className);
  }
  if (property.get) {
    yield formatGetter(name, property.get, className);
  }
  if (property.set) {
    yield formatSetter(name, property.set, className);
  }
}
function* iterateGetters(object) {
  for (const key of gettersof(object)) {
    yield formatAccessor(key, object, "observablehq--symbol");
  }
}
function* iterateObject(object) {
  for (const key of fieldsof(object)) {
    for (const field of iterateProperty(key, object)) {
      yield field;
    }
  }
  for (const getter of iterateGetters(object)) {
    yield getter;
  }
  yield formatPrototype("<prototype>", object, "observablehq--symbol");
}
const formatPrototype = (name, object, className) => formatField(name, Object.getPrototypeOf(object), `${className} observablehq--prototype`);
function formatField(name, value, className) {
  const item = document.createElement("div");
  const span = item.appendChild(document.createElement("span"));
  item.className = "observablehq--field";
  span.className = className;
  span.textContent = `  ${name}`;
  item.appendChild(document.createTextNode(": "));
  item.appendChild(inspect(value));
  return item;
}
const formatElement = (index, value, className) => formatField(index, value, className);
const formatGetter = (name, value, className) => formatField(`get ${name}`, value, className);
const formatSetter = (name, value, className) => formatField(`set ${name}`, value, className);
function formatProperty(name, key, object, className) {
  const property = propertyof(object, key);
  const item = document.createElement("div");
  const span = item.appendChild(document.createElement("span"));
  item.className = "observablehq--field";
  span.className = `${className}${fildProperies(property)}`;
  span.textContent = `  ${name}`;
  item.appendChild(document.createTextNode(": "));
  if ("value" in property) {
    item.appendChild(inspect(property.value));
  } else {
    item.appendChild(inspect(FORBIDDEN));
  }
  return item;
}
function formatAccessor(key, object, className) {
  const name = typeof key === "string" ? key : formatSymbol(key);
  const item = document.createElement("div");
  const span = item.appendChild(document.createElement("span"));
  item.className = "observablehq--field";
  span.className = `${className} observablehq--getter`;
  span.textContent = `  ${name}`;
  item.appendChild(document.createTextNode(": "));
  const a = item.appendChild(document.createElement("a"));
  a.className = "observablehq--getter";
  a.appendChild(document.createTextNode("(...)"));
  a.addEventListener("mouseup", function(event) {
    event.stopPropagation();
    replace(a, inspect(valueof(object, key)));
  });
  return item;
}
function fildProperies(descriptor) {
  const classNames = [];
  if (!descriptor.enumerable) {
    classNames.push("observablehq--non-enumerable");
  }
  if (descriptor.configurable) {
    classNames.push("observablehq--non-configurable");
  }
  if (descriptor.writable) {
    classNames.push("observablehq--writable");
  }
  if (descriptor.get) {
    classNames.push("observablehq--getter");
  }
  if (descriptor.set) {
    classNames.push("observablehq--setter");
  }
  return classNames.length > 0 ? classNames.join(" ") : "";
}
function formatMapField(key, value) {
  const item = document.createElement("div");
  item.className = "observablehq--field";
  item.appendChild(document.createTextNode("  "));
  item.appendChild(inspect(key));
  item.appendChild(document.createTextNode(" => "));
  item.appendChild(inspect(value));
  return item;
}
function formatSetField(value) {
  const item = document.createElement("div");
  item.className = "observablehq--field";
  item.appendChild(document.createTextNode("  "));
  item.appendChild(inspect(value));
  return item;
}
