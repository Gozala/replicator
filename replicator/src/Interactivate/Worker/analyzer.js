const parser = require("@babel/parser")
const traverse = require("@babel/traverse")

const analyzeAST = ast => {
  let result = null
  traverse.default(ast, {
    Block(path) {
      if (path.node.type === "Program") {
        result = path.scope
        return
      }
    }
  })
  return result
}

const defaultOptions = {
  sourceType: "module",
  plugins: [
    "asyncGenerators",
    "objectRestSpread",
    "dynamicImport",
    "exportDefaultFrom"
  ]
}

const analyzeSource = (code, options = defaultOptions) =>
  analyzeAST(parser.parse(code, options))

self.onmessage = function(message) {
  const [id, source, options] = message.data
  try {
    const { bindings, globals, labels } = analyzeSource(source, options)

    self.postMessage([
      id,
      {
        ok: {
          labels: Object.keys(labels),
          bindings: Object.keys(bindings),
          globals: Object.keys(globals)
        }
      }
    ])
  } catch (error) {
    self.postMessage([
      id,
      {
        error: {
          name: error.name,
          message: error.message,
          loc: error.loc
        }
      }
    ])
  }
}
