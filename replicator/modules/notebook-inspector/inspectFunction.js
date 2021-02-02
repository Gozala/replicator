var toString = Function.prototype.toString, TYPE_ASYNC = {prefix: "async \u0192"}, TYPE_ASYNC_GENERATOR = {prefix: "async \u0192*"}, TYPE_CLASS = {prefix: "class"}, TYPE_FUNCTION = {prefix: "\u0192"}, TYPE_ARROW_FUNCTION = {prefix: "\u03BB"}, TYPE_GENERATOR = {prefix: "\u0192*"};
export default function inspectFunction(f) {
  var type, m, t = toString.call(f);
  switch (f.constructor && f.constructor.name) {
    case "AsyncFunction":
      type = TYPE_ASYNC;
      break;
    case "AsyncGeneratorFunction":
      type = TYPE_ASYNC_GENERATOR;
      break;
    case "GeneratorFunction":
      type = TYPE_GENERATOR;
      break;
    default: {
      switch (t.substr(0, 4)) {
        case "clas": {
          type = TYPE_CLASS;
          break;
        }
        case "func": {
          type = TYPE_FUNCTION;
          break;
        }
        case "get ": {
          type = TYPE_FUNCTION;
          break;
        }
        case "set ": {
          type = TYPE_FUNCTION;
          break;
        }
        default: {
          type = TYPE_ARROW_FUNCTION;
          break;
        }
      }
      break;
    }
  }
  if (type === TYPE_CLASS) {
    return formatFunction(type, f.name || "");
  }
  if (m = /^(?:async\s*)?(\w+)\s*=>/.exec(t)) {
    return formatFunction(type, "(" + m[1] + ")");
  }
  if (m = /^(?:async\s*)?\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(t)) {
    return formatFunction(type, m[1] ? "(" + m[1].replace(/\s*,\s*/g, ", ") + ")" : "()");
  }
  if (m = /^(?:async\s*)?function(?:\s*\*)?(?:\s*\w+)?\s*\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(t)) {
    return formatFunction(type, (f.name || "") + (m[1] ? "(" + m[1].replace(/\s*,\s*/g, ", ") + ")" : "()"));
  }
  return formatFunction(type, displayName(f.name || "") + "(\u2026)");
}
const displayName = (name) => {
  switch (name.substr(0, 4)) {
    case "get ": {
      return name.substr(4);
    }
    case "set ": {
      return name.substr(4);
    }
    default: {
      return name;
    }
  }
};
function formatFunction(type, name) {
  var span = document.createElement("span");
  span.className = "observablehq--function";
  var spanType = span.appendChild(document.createElement("span"));
  spanType.className = "observablehq--keyword";
  spanType.textContent = type.prefix;
  span.appendChild(document.createTextNode(" " + name));
  return span;
}
