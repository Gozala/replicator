import {inspect, replace} from "./inspect.js";
const NEWLINE_LIMIT = 20;
export default function formatString(string, shallow, expanded) {
  if (shallow === false) {
    if (count(string, /["\n]/g) <= count(string, /`|\${/g)) {
      const span3 = document.createElement("span");
      span3.className = "observablehq--string";
      span3.textContent = JSON.stringify(string);
      return span3;
    }
    const lines = string.split("\n");
    if (lines.length > NEWLINE_LIMIT && !expanded) {
      const div = document.createElement("div");
      div.className = "observablehq--string";
      div.textContent = "`" + templatify(lines.slice(0, NEWLINE_LIMIT).join("\n"));
      const splitter = div.appendChild(document.createElement("span"));
      const truncatedCount = lines.length - NEWLINE_LIMIT;
      splitter.textContent = `Show ${truncatedCount} truncated line${truncatedCount > 1 ? "s" : ""}`;
      splitter.className = "observablehq--string-expand";
      splitter.addEventListener("mouseup", function(event) {
        event.stopPropagation();
        replace(div, inspect(string, shallow, true));
      });
      return div;
    }
    const span2 = document.createElement("span");
    span2.className = `observablehq--string${expanded ? " observablehq--expanded" : ""}`;
    span2.textContent = "`" + templatify(string) + "`";
    return span2;
  }
  const span = document.createElement("span");
  span.className = "observablehq--string";
  span.textContent = JSON.stringify(string.length > 100 ? `${string.slice(0, 50)}\u2026${string.slice(-49)}` : string);
  return span;
}
function templatify(string) {
  return string.replace(/[\\`\x00-\x09\x0b-\x19]|\${/g, templatifyChar);
}
function templatifyChar(char) {
  var code = char.charCodeAt(0);
  return code < 16 ? "\\x0" + code.toString(16) : code < 32 ? "\\x" + code.toString(16) : "\\" + char;
}
function count(string, re) {
  var n = 0;
  while (re.exec(string))
    ++n;
  return n;
}
