const symbolToString = Symbol.prototype.toString;
export default function formatSymbol(symbol) {
  return symbolToString.call(symbol);
}
