function dispatch(e, t, n) {
  n = n || {};
  var o = e.ownerDocument, r = o.defaultView.CustomEvent;
  typeof r == "function" ? r = new r(t, {detail: n}) : ((r = o.createEvent("Event")).initEvent(t, false, false), r.detail = n), e.dispatchEvent(r);
}
function isarray(e) {
  return Array.isArray(e) || e instanceof Int8Array || e instanceof Int16Array || e instanceof Int32Array || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Uint16Array || e instanceof Uint32Array || e instanceof Float32Array || e instanceof Float64Array;
}
function isindex(e) {
  return e === (0 | e) + "";
}
const symbolToString = Symbol.prototype.toString;
function formatSymbol(e) {
  return symbolToString.call(e);
}
const {getOwnPropertySymbols, getOwnPropertyDescriptor, getOwnPropertyNames, getPrototypeOf, prototype: {hasOwnProperty}} = Object, {toStringTag} = Symbol, FORBIDDEN = {}, symbolsof = getOwnPropertySymbols, namesof = getOwnPropertyNames, propertyof = getOwnPropertyDescriptor;
function isown(e, t) {
  return hasOwnProperty.call(e, t);
}
function tagof(e) {
  return e[toStringTag] || e.constructor && e.constructor.name || "Object";
}
function valueof(e, t) {
  try {
    const n = e[t];
    return n && n.constructor, n;
  } catch (e2) {
    return FORBIDDEN;
  }
}
function* fieldsof(e) {
  for (const t of namesof(e))
    yield t;
  for (const t of symbolsof(e))
    yield t;
}
function* gettersof(e) {
  let t = getPrototypeOf(e);
  for (; t; ) {
    for (const e2 of fieldsof(t))
      switch (e2) {
        case "__proto__":
          break;
        default:
          propertyof(t, e2).get && (yield e2);
      }
    t = getPrototypeOf(t);
  }
}
function inspectExpanded(e) {
  const t = isarray(e);
  let n, o;
  e instanceof Map ? (n = `Map(${e.size})`, o = iterateMap) : e instanceof Set ? (n = `Set(${e.size})`, o = iterateSet) : t ? (n = `${e.constructor.name}(${e.length})`, o = iterateArray) : (n = tagof(e), o = iterateObject);
  const r = document.createElement("span");
  r.className = "observablehq--expanded";
  const a = r.appendChild(document.createElement("a"));
  a.innerHTML = "<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M4 7L0 1h8z' fill='currentColor' />\n  </svg>", a.appendChild(document.createTextNode(`${n}${t ? " [" : " {"}`)), a.addEventListener("mouseup", function(t2) {
    t2.stopPropagation(), replace(r, inspectCollapsed(e));
  }), o = o(e);
  let s = 20, i = {done: true};
  for (; s-- > 0 && !(i = o.next()).done; )
    r.appendChild(i.value);
  if (!i.done) {
    const {value: e2} = i, t2 = r.appendChild(document.createElement("a"));
    t2.className = "observablehq--field", t2.style.display = "block", t2.appendChild(document.createTextNode("  \u2026 more")), t2.addEventListener("mouseup", function(n2) {
      n2.stopPropagation(), r.insertBefore(e2, t2);
      for (let e3 = 0; !(i = o.next()).done && e3 < 19; ++e3)
        i.done || r.insertBefore(i.value, t2);
      i.done && r.removeChild(t2), dispatch(r, "load");
    });
  }
  return r.appendChild(document.createTextNode(t ? "]" : "}")), r;
}
function* iterateMap(e) {
  for (const [t, n] of e)
    yield formatMapField(t, n);
  yield* iterateObject(e);
}
function* iterateSet(e) {
  for (const t of e)
    yield formatSetField(t);
  yield* iterateObject(e);
}
function* iterateArray(e) {
  for (let t = 0, n = e.length; t < n; ++t)
    t in e && (yield formatElement(t, valueof(e, t), "observablehq--index"));
  for (const t in fieldsof(e))
    if (!isindex(t))
      for (const n of iterateProperty(t, e))
        yield n;
  for (const t of iterateGetters(e))
    yield t;
}
function* iterateProperty(e, t) {
  const n = propertyof(t, e), [o, r] = typeof e == "string" ? [e, "observablehq--key"] : [formatSymbol(e), "observablehq--symbol"];
  "value" in n && (yield formatField(o, valueof(n, "value"), r)), n.get && (yield formatGetter(o, n.get, r)), n.set && (yield formatSetter(o, n.set, r));
}
function* iterateGetters(e) {
  for (const t of gettersof(e))
    yield formatAccessor(t, e, "observablehq--symbol");
}
function* iterateObject(e) {
  for (const t of fieldsof(e))
    for (const n of iterateProperty(t, e))
      yield n;
  for (const t of iterateGetters(e))
    yield t;
  yield formatPrototype("<prototype>", e, "observablehq--symbol");
}
const formatPrototype = (e, t, n) => formatField(e, Object.getPrototypeOf(t), `${n} observablehq--prototype`);
function formatField(e, t, n) {
  const o = document.createElement("div"), r = o.appendChild(document.createElement("span"));
  return o.className = "observablehq--field", r.className = n, r.textContent = `  ${e}`, o.appendChild(document.createTextNode(": ")), o.appendChild(inspect(t)), o;
}
const formatElement = (e, t, n) => formatField(e, t, n), formatGetter = (e, t, n) => formatField(`get ${e}`, t, n), formatSetter = (e, t, n) => formatField(`set ${e}`, t, n);
function formatAccessor(e, t, n) {
  const o = typeof e == "string" ? e : formatSymbol(e), r = document.createElement("div"), a = r.appendChild(document.createElement("span"));
  r.className = "observablehq--field", a.className = `${n} observablehq--getter`, a.textContent = `  ${o}`, r.appendChild(document.createTextNode(": "));
  const s = r.appendChild(document.createElement("a"));
  return s.className = "observablehq--getter", s.appendChild(document.createTextNode("(...)")), s.addEventListener("mouseup", function(n2) {
    n2.stopPropagation(), replace(s, inspect(valueof(t, e)));
  }), r;
}
function formatMapField(e, t) {
  const n = document.createElement("div");
  return n.className = "observablehq--field", n.appendChild(document.createTextNode("  ")), n.appendChild(inspect(e)), n.appendChild(document.createTextNode(" => ")), n.appendChild(inspect(t)), n;
}
function formatSetField(e) {
  const t = document.createElement("div");
  return t.className = "observablehq--field", t.appendChild(document.createTextNode("  ")), t.appendChild(inspect(e)), t;
}
function inspectCollapsed(e, t) {
  const n = isarray(e);
  let o, r, a;
  if (e instanceof Map ? (o = `Map(${e.size})`, r = iterateMap$1) : e instanceof Set ? (o = `Set(${e.size})`, r = iterateSet$1) : n ? (o = `${e.constructor.name}(${e.length})`, r = iterateArray$1) : (o = tagof(e), r = iterateObject$1), t) {
    const t2 = document.createElement("span");
    return t2.className = "observablehq--shallow", t2.appendChild(document.createTextNode(o)), t2.addEventListener("mouseup", function(n2) {
      n2.stopPropagation(), replace(t2, inspectCollapsed(e));
    }), t2;
  }
  const s = document.createElement("span");
  s.className = "observablehq--collapsed";
  const i = s.appendChild(document.createElement("a"));
  i.innerHTML = "<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M7 4L1 8V0z' fill='currentColor' />\n  </svg>", i.appendChild(document.createTextNode(`${o}${n ? " [" : " {"}`)), s.addEventListener("mouseup", function(t2) {
    t2.stopPropagation(), replace(s, inspectExpanded(e));
  }, true), r = r(e);
  for (let e2 = 0; !(a = r.next()).done && e2 < 20; ++e2)
    e2 > 0 && s.appendChild(document.createTextNode(", ")), a.value && s.appendChild(a.value);
  return a.done || s.appendChild(document.createTextNode(", \u2026")), s.appendChild(document.createTextNode(n ? "]" : "}")), s;
}
function* iterateMap$1(e) {
  for (const [t, n] of e)
    yield formatMapField$1(t, n);
  yield* iterateObject$1(e);
}
function* iterateSet$1(e) {
  for (const t of e)
    yield inspect(t, true);
  yield* iterateObject$1(e);
}
function* iterateArray$1(e) {
  for (let t = -1, n = 0, o = e.length; n < o; ++n)
    if (n in e) {
      let o2 = n - t - 1;
      if (o2 > 0) {
        const e2 = document.createElement("span");
        e2.className = "observablehq--empty", e2.textContent = o2 === 1 ? "empty" : `empty \xD7 ${n - t - 1}`, yield e2;
      }
      yield inspect(valueof(e, n), true), t = n;
    }
  for (const t in e)
    !isindex(t) && isown(e, t) && (yield formatField$1(t, valueof(e, t), "observablehq--key"));
  for (const t of symbolsof(e))
    yield formatField$1(formatSymbol(t), valueof(e, t), "observablehq--symbol");
}
function* iterateObject$1(e) {
  for (const t of fieldsof(e)) {
    const n = propertyof(e, t);
    if ("value" in n) {
      const [e2, o] = typeof t == "string" ? [t, "observablehq--key"] : [formatSymbol(t), "observablehq--symbol"];
      yield formatField$1(e2, valueof(n, "value"), o);
    }
  }
}
function formatField$1(e, t, n) {
  const o = document.createDocumentFragment(), r = o.appendChild(document.createElement("span"));
  return r.className = n, r.textContent = e, o.appendChild(document.createTextNode(": ")), o.appendChild(inspect(t, true)), o;
}
function formatMapField$1(e, t) {
  const n = document.createDocumentFragment();
  return n.appendChild(inspect(e, true)), n.appendChild(document.createTextNode(" => ")), n.appendChild(inspect(t, true)), n;
}
function pad(e, t) {
  var n = e + "", o = n.length;
  return o < t ? new Array(t - o + 1).join(0) + n : n;
}
function formatDate(e) {
  return isNaN(e) ? "Invalid Date" : pad(e.getFullYear(), 4) + "-" + pad(e.getMonth() + 1, 2) + "-" + pad(e.getDate(), 2) + (e.getMilliseconds() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) + ":" + pad(e.getSeconds(), 2) + "." + pad(e.getMilliseconds(), 3) : e.getSeconds() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) + ":" + pad(e.getSeconds(), 2) : e.getMinutes() || e.getHours() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) : "");
}
var errorToString = Error.prototype.toString;
function formatError(e) {
  return e.stack || errorToString.call(e);
}
var regExpToString = RegExp.prototype.toString;
function formatRegExp(e) {
  return regExpToString.call(e);
}
const NEWLINE_LIMIT = 20;
function formatString(e, t, n) {
  if (t === false) {
    if (count(e, /["\n]/g) <= count(e, /`|\${/g)) {
      const t2 = document.createElement("span");
      return t2.className = "observablehq--string", t2.textContent = JSON.stringify(e), t2;
    }
    const o2 = e.split("\n");
    if (o2.length > NEWLINE_LIMIT && !n) {
      const n2 = document.createElement("div");
      n2.className = "observablehq--string", n2.textContent = "`" + templatify(o2.slice(0, NEWLINE_LIMIT).join("\n"));
      const r2 = n2.appendChild(document.createElement("span")), a = o2.length - NEWLINE_LIMIT;
      return r2.textContent = `Show ${a} truncated line${a > 1 ? "s" : ""}`, r2.className = "observablehq--string-expand", r2.addEventListener("mouseup", function(o3) {
        o3.stopPropagation(), replace(n2, inspect(e, t, true));
      }), n2;
    }
    const r = document.createElement("span");
    return r.className = `observablehq--string${n ? " observablehq--expanded" : ""}`, r.textContent = "`" + templatify(e) + "`", r;
  }
  const o = document.createElement("span");
  return o.className = "observablehq--string", o.textContent = JSON.stringify(e.length > 100 ? `${e.slice(0, 50)}\u2026${e.slice(-49)}` : e), o;
}
function templatify(e) {
  return e.replace(/[\\`\x00-\x09\x0b-\x19]|\${/g, templatifyChar);
}
function templatifyChar(e) {
  var t = e.charCodeAt(0);
  return t < 16 ? "\\x0" + t.toString(16) : t < 32 ? "\\x" + t.toString(16) : "\\" + e;
}
function count(e, t) {
  for (var n = 0; t.exec(e); )
    ++n;
  return n;
}
var toString = Function.prototype.toString, TYPE_ASYNC = {prefix: "async \u0192"}, TYPE_ASYNC_GENERATOR = {prefix: "async \u0192*"}, TYPE_CLASS = {prefix: "class"}, TYPE_FUNCTION = {prefix: "\u0192"}, TYPE_ARROW_FUNCTION = {prefix: "\u03BB"}, TYPE_GENERATOR = {prefix: "\u0192*"};
function inspectFunction(e) {
  var t, n, o = toString.call(e);
  switch (e.constructor && e.constructor.name) {
    case "AsyncFunction":
      t = TYPE_ASYNC;
      break;
    case "AsyncGeneratorFunction":
      t = TYPE_ASYNC_GENERATOR;
      break;
    case "GeneratorFunction":
      t = TYPE_GENERATOR;
      break;
    default:
      switch (o.substr(0, 4)) {
        case "clas":
          t = TYPE_CLASS;
          break;
        case "func":
        case "get ":
        case "set ":
          t = TYPE_FUNCTION;
          break;
        default:
          t = TYPE_ARROW_FUNCTION;
      }
  }
  return t === TYPE_CLASS ? formatFunction(t, e.name || "") : (n = /^(?:async\s*)?(\w+)\s*=>/.exec(o)) ? formatFunction(t, "(" + n[1] + ")") : (n = /^(?:async\s*)?\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(o)) ? formatFunction(t, n[1] ? "(" + n[1].replace(/\s*,\s*/g, ", ") + ")" : "()") : (n = /^(?:async\s*)?function(?:\s*\*)?(?:\s*\w+)?\s*\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(o)) ? formatFunction(t, (e.name || "") + (n[1] ? "(" + n[1].replace(/\s*,\s*/g, ", ") + ")" : "()")) : formatFunction(t, displayName(e.name || "") + "(\u2026)");
}
const displayName = (e) => {
  switch (e.substr(0, 4)) {
    case "get ":
    case "set ":
      return e.substr(4);
    default:
      return e;
  }
};
function formatFunction(e, t) {
  var n = document.createElement("span");
  n.className = "observablehq--function";
  var o = n.appendChild(document.createElement("span"));
  return o.className = "observablehq--keyword", o.textContent = e.prefix, n.appendChild(document.createTextNode(" " + t)), n;
}
const {prototype: {toString: toString$1}} = Object;
function inspect(e, t, n) {
  let o = typeof e;
  switch (o) {
    case "boolean":
    case "undefined":
      e += "";
      break;
    case "number":
      e = e === 0 && 1 / e < 0 ? "-0" : e + "";
      break;
    case "bigint":
      e += "n";
      break;
    case "symbol":
      e = formatSymbol(e);
      break;
    case "function":
      return inspectFunction(e);
    case "string":
      return formatString(e, t, n);
    default:
      if (e === null) {
        o = null, e = "null";
        break;
      }
      if (e instanceof Date) {
        o = "date", e = formatDate(e);
        break;
      }
      if (e === FORBIDDEN) {
        o = "forbidden", e = "[forbidden]";
        break;
      }
      switch (toString$1.call(e)) {
        case "[object RegExp]":
          o = "regexp", e = formatRegExp(e);
          break;
        case "[object Error]":
        case "[object DOMException]":
          o = "error", e = formatError(e);
          break;
        default:
          return (n ? inspectExpanded : inspectCollapsed)(e, t);
      }
  }
  const r = document.createElement("span");
  return r.className = `observablehq--${o}`, r.textContent = e, r;
}
function replace(e, t) {
  e.classList.contains("observablehq--inspect") && t.classList.add("observablehq--inspect"), e.parentNode.replaceChild(t, e), dispatch(t, "load");
}
const LOCATION_MATCH = /\s+\(\d+:\d+\)$/m;
class Inspector {
  constructor(e) {
    if (!e)
      throw new Error("invalid node");
    this._node = e, e.classList.add("observablehq");
  }
  pending() {
    const {_node: e} = this;
    e.classList.remove("observablehq--error"), e.classList.add("observablehq--running");
  }
  fulfilled(e) {
    const {_node: t} = this;
    if ((!(e instanceof Element || e instanceof Text) || e.parentNode && e.parentNode !== t) && (e = inspect(e, false, t.firstChild && t.firstChild.classList && t.firstChild.classList.contains("observablehq--expanded"))).classList.add("observablehq--inspect"), t.classList.remove("observablehq--running", "observablehq--error"), t.firstChild !== e)
      if (t.firstChild) {
        for (; t.lastChild !== t.firstChild; )
          t.removeChild(t.lastChild);
        t.replaceChild(e, t.firstChild);
      } else
        t.appendChild(e);
    dispatch(t, "update");
  }
  rejected(e) {
    const {_node: t} = this;
    for (t.classList.remove("observablehq--running"), t.classList.add("observablehq--error"); t.lastChild; )
      t.removeChild(t.lastChild);
    var n = document.createElement("span");
    n.className = "observablehq--inspect", n.textContent = (e + "").replace(LOCATION_MATCH, ""), t.appendChild(n), dispatch(t, "error", {error: e});
  }
}
Inspector.into = function(e) {
  if (typeof e == "string" && (e = document.querySelector(e)) == null)
    throw new Error("container not found");
  return function() {
    return new Inspector(e.appendChild(document.createElement("div")));
  };
};
export {Inspector};
