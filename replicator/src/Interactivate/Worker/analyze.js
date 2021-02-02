// @noflow

const global = self

self.importScripts("./analyzer.bundle.js")

self.onmessage = (message /*:MessageEvent*/) => {
  const { bindings, globals, labels } = analyzer.analyzeSource(
    message.data.source
  )

  self.postMessage({
    id: message.data.id,
    labels: Object.keys(labels),
    bindings: Object.keys(bindings),
    globals: Object.keys(globals)
  })
}
