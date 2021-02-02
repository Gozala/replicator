import { DocumentWidget } from "./Document.js"

/**
 * @template T
 * @typedef {import('./Program').DocumentView<T>} DocumentView
 */
/**
 * @template Message, State
 * @extends {DocumentWidget<Message, State>}
 */
class ApplicationWidget extends DocumentWidget {
  /**
   *
   * @param {import('./Program').Router<Message>} router
   */
  constructor(router) {
    super()
    this.onExternalURLRequest = router.onExternalURLRequest
    this.onInternalURLRequest = router.onInternalURLRequest
    this.onURLChange = router.onURLChange
  }
  getURL() {
    return new URL(this.root.location.href)
  }
  /**
   * @param {MouseEvent} event
   */
  handleEvent(event) {
    switch (event.type) {
      case "navigate": // manually notify when we do pushState replaceState
      case "popstate":
      case "hashchange":
        return this.thread.send(this.onURLChange(this.getURL()))
      case "click": {
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          event.button < 1 &&
          // @ts-ignore
          !event.target.target &&
          // @ts-ignore
          !event.target.download
        ) {
          event.preventDefault()
          const current = this.getURL()
          // @ts-ignore
          const next = new URL(event.currentTarget.href, current.href)

          const isInternal =
            current.protocol === next.protocol &&
            current.host === next.host &&
            current.port === next.port

          const message = isInternal
            ? this.onInternalURLRequest(next)
            : this.onExternalURLRequest(next)

          return this.thread.send(message)
        }
      }
    }
    return undefined
  }

  /**
   * @param {Document} document
   */
  addListeners(document) {
    const top = document.defaultView
    if (top) {
      top.addEventListener("popstate", this)
      top.addEventListener("hashchange", this)
      // @ts-ignore
      top.onnavigate = this
    } else {
      throw new Error("document.defaultView is not defined")
    }
  }
}

/**
 * @template {{url?:URL}} Options
 * @template Message, State
 * @param {import('./Program').Application<Message, State, DocumentView<Message>, Options>} application
 * @param {Options} options
 * @param {Document} document
 * @returns {ApplicationWidget<Message, State>}
 */
export const spawn = (
  application,
  options,
  document
) /*: ApplicationWidget<a, model, config> */ => {
  const self = new ApplicationWidget(application)
  const root = DocumentWidget.root(document)
  self.update = application.update
  self.view = application.view
  self.root = root
  self.node = root.widget ? root.widget.node : self.mount(root)
  self.thread = self.fork(root)
  root.widget = self
  self.addListeners(document)
  options.url = self.getURL()
  self.transact(application.init(options))

  return self
}
