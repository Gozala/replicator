// @flow strict

import { virtualize, diff, patch, doc } from "./VirtualDOM.js"
import { Widget, MainThread } from "./Widget.js"

/**
 * @template Message
 * @typedef {import('./Program').DocumentView<Message>} DocumentView
 */

/**
 * @template Message
 * @typedef {{
 *  body: Element
 *  title: string
 *  location: Location
 *  widget?: {
 *    node: DocumentView<Message>
 *    thread: MainThread<Message>
 *  }
 * }} RenderedDocument
 */

/**
 * @template Message, State
 * @extends {Widget<Message, State, DocumentView<Message>, RenderedDocument<Message>>}
 */
export class DocumentWidget extends Widget {
  /**
   * @template Message
   * @param {Document} document
   * @returns {RenderedDocument<Message>}
   */
  static root(document) {
    const root = document
    if (!document.body) {
      document.appendChild(document.createElement("body"))
    }
    return root
  }
  /**
   * @param {RenderedDocument<Message>} root
   * @returns {DocumentView<Message>}
   */
  mount(root) {
    return root.widget
      ? root.widget.node
      : doc(root.title, virtualize(root.body))
  }
  /**
   *
   * @param {RenderedDocument<Message>} root
   * @returns {MainThread<Message>}
   */
  fork(root) {
    const thread = root.widget ? root.widget.thread : Widget.fork(this)
    thread.root = this
    return thread
  }
  /**
   *
   * @param {State} state
   */
  render(state) {
    const newDocument = this.view(state)
    const renderedDocument = this.node
    const delta = diff(renderedDocument.body, newDocument.body)
    patch(this.root.body, renderedDocument.body, delta, this.thread)
    this.node = newDocument
    if (renderedDocument.title !== newDocument.title) {
      this.root.title = newDocument.title
    }
  }
}

/**
 * @template Message, State, Options
 * @param {import('./Program').Program<Message, State, DocumentView<Message>, Options>} program
 * @param {Options} options
 * @param {Document} document
 * @returns {Widget<Message, State, DocumentView<Message>, RenderedDocument<Message>>}
 */
export const spawn = ({ init, update, view }, options, document) => {
  const self = new DocumentWidget()
  const root = DocumentWidget.root(document)
  self.update = update
  self.view = view
  self.root = root
  self.node = self.mount(root)
  self.thread = self.fork(root)
  root.widget = self
  self.transact(init(options))
  return self
}
