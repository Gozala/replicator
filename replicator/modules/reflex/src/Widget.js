import { diff, patch, virtualize } from "./VirtualDOM.js"

/**
 * @typedef {import('./Task').ThreadID} ThreadID
 * @typedef {import('./Task').Thread} Thread
 */

/**
 * @template T
 * @typedef {import('./Task').Main<T>} Main
 */

/**
 * @template T
 * @typedef {import('./Task').Sync<T>} Sync
 */

/**
 * @template T
 * @implements {Main<T>}
 */
export class MainThread {
  /**
   * @param {import('./Task').Sync<T>} root
   */
  constructor(root) {
    this.root = root
    /**
     * @private
     * @type {Record<string, Thread>}
     */
    this.threads
    /**
     * @private
     * @type {number}
     */
    this.threadID
  }

  /**
   * Sends a message to this program
   *
   * @param {T} message
   */
  async send(message) {
    await 0
    this.root.sync(message)
  }

  /**
   * @param {T} message
   */
  sync(message) {
    this.root.sync(message)
  }

  /**
   * @param {Thread} thread
   * @returns {ThreadID}
   */
  link(thread) {
    if (this.threadID == null) {
      this.threadID = 0
      this.threads = {}
    }

    const id = `@${++this.threadID}`
    this.threads[id] = thread
    // @ts-expect-error - string isn't ThreadID
    return id
  }

  /**
   * @param {Thread} thread
   */
  unlink(thread) {
    const { threads } = this
    if (threads) {
      for (const id in threads) {
        if (thread === threads[id]) {
          delete threads[id]
          break
        }
      }
    }
  }

  /**
   * @param {ThreadID} threadID
   */
  linked(threadID) {
    const { threads } = this
    if (threads) {
      return threads[threadID]
    }
    return undefined
  }
}

/**
 * @template Message, State
 * @typedef {import('./Task').Transaction<Message, State>} Transaction
 */

/**
 * @template T, State, View, Target
 */
export class Widget {
  constructor() {
    /** @type {MainThread<T>} */
    this.thread
    /** @type {State} */
    this.state
    /** @type {(message:T, state:State) => Transaction<T, State>} */
    this.update
    /** @type {(state:State) => View} */
    this.view
    /** @type {Target} */
    this.root
    /** @type {View} */
    this.node
  }
  get version() {
    const stack = new Error().stack || ""
    const start = stack.indexOf("+")
    const end = stack.indexOf("/", start)
    return stack.slice(start, end)
  }

  /**
   * @template T
   * @param {Sync<T>} self
   * @returns {MainThread<T>}
   */
  static fork(self /*: Sync<a> */) /*: MainThread<a> */ {
    return new MainThread(self)
  }

  /**
   *
   * @param {T} message
   */
  sync(message) {
    this.transact(this.update(message, this.state))
  }

  /**
   * @param {Transaction<T, State>} transaction
   */
  transact([state, fx] /*: Transaction<a, model> */) {
    this.state = state
    this.render(state)
    fx.perform(this.thread)
  }

  /**
   * @param {State} _state
   */
  render(_state) {}

  /**
   * @param {Target} _root
   * @returns {View}
   */
  mount(_root) {
    return this.node
  }
  toJSON() {
    return this.state
  }
}

/**
 * @template T
 * @typedef {import('./VirtualDOM').Node<T>} Node
 */

/**
 * @template T, State
 * @extends {Widget<T, State, Node<T>, Element>}
 */
class ElementWidget extends Widget {
  /**
   * @param {Element} root
   * @returns {Node<T>}
   */
  mount(root) {
    return virtualize(root)
  }

  /**
   * @param {State} state
   */
  render(state) {
    const newNode = this.view(state)
    const renderedNode = this.node
    const delta = diff(renderedNode, newNode)
    patch(this.root, renderedNode, delta, this.thread)
    this.node = newNode
  }
}

/**
 * @template Message, State, View, Options
 * @typedef {import('./Program').Program<Message, State, View, Options>} Program
 */
/**
 * @template Message, State, Options
 * @param {Program<Message, State, Node<Message>, Options>} program
 * @param {Options} options
 * @param {Element} root
 * @returns {Widget<Message, State, Node<Message>, Element>}
 */
export const spawn = ({ init, update, view }, options, root) => {
  const self = new ElementWidget()
  self.thread = Widget.fork(self)
  self.update = update
  self.view = view
  self.root = root
  self.node = self.mount(root)
  self.transact(init(options))
  return self
}
