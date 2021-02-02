import { nothing } from "./Basics.js"

/**
 * @template T
 * @typedef {import('./Task').Effect<T>} Effect<T>
 */

/**
 * @implements {Effect<any>}
 */
class None {
  perform() {}
  map() {
    return this
  }
}

const none = new None()

/**
 * @template T
 * @typedef {import('./Task').Main<T>} Main
 */
/**
 * @template T
 * @implements {Effect<T>}
 */
class Send {
  /**
   *
   * @param {T} message
   */
  constructor(message) {
    /**
     * @private
     */
    this.message = message
  }
  /**
   * @param {Main<T>} main
   */
  perform(main) {
    main.send(this.message)
  }
  /**
   * @template U
   * @param {(value:T) => U} tag
   * @returns {Effect<U>}
   */
  map(tag) {
    return new Tagged(this, tag)
  }
}

/**
 * @template X, I, O
 */
class FX {
  /**
   * @param {import('./Task').Task<X, I>} task
   * @param {(value:I) => void|O} success
   * @param {(error:X) => void|O} failure
   */
  constructor(task, success, failure) {
    /**
     * @private
     */
    this.task = task
    /**
     * @private
     */
    this.success = success
    /**
     * @private
     */
    this.failure = failure
  }

  /**
   * @private
   * @param {Main<O>} main
   */
  async execute(main) {
    try {
      const value = await this.task()
      const message = this.success(value)
      if (message != null) {
        main.send(message)
      }
    } catch (error) {
      const message = this.failure(error)
      if (message != null) {
        main.send(message)
      }
    }
  }

  /**
   * @param {Main<O>} main
   */
  perform(main) {
    this.execute(main)
  }

  /**
   * @template U
   * @param {(value:O) => U} tag
   * @returns {Effect<U>}
   */
  map(tag) {
    return new Tagged(this, tag)
  }
}

/**
 * @template T
 * @implements {Effect<T>}
 */
class Batch {
  /**
   *
   * @param {Effect<T>[]} effects
   */
  constructor(effects) {
    /**
     * @private
     */
    this.effects = effects
  }

  /**
   * @param {Main<T>} main
   */
  perform(main) {
    for (const fx of this.effects) {
      fx.perform(main)
    }
  }

  /**
   * @template U
   * @param {(value:T) => U} tag
   * @returns {Effect<U>}
   */
  map(tag) {
    return new Tagged(this, tag)
  }
}

/**
 * @typedef {import('./Task').Thread} Thread
 * @typedef {import('./Task').ThreadID} ThreadID
 */

/**
 * @template T, U
 * @implements {Effect<U>}
 * @implements {Main<T>}
 */
export class Tagged {
  /**
   * @param {Effect<T>} fx
   * @param {(value:T) => U} tag
   */
  constructor(fx, tag) {
    /**
     * @private
     */
    this.fx = fx
    /**
     * @private
     */
    this.tag = tag
    /**
     * @private
     * @type {Main<U>}
     */
    this.port
  }
  /**
   *
   * @param {Main<U>} main
   */
  perform(main) {
    this.port = main
    this.fx.perform(this)
  }

  /**
   * @param {Thread} thread
   */
  link(thread) {
    return this.port.link(thread)
  }
  /**
   * @param {Thread} thread
   */
  unlink(thread) {
    return this.port.unlink(thread)
  }
  /**
   * @param {ThreadID} id
   */
  linked(id) {
    return this.port.linked(id)
  }
  /**
   * @param {T} message
   */
  send(message) {
    return this.port.send(this.tag(message))
  }
  /**
   * @template E
   * @param {(value:U) => E} tag
   * @returns {Effect<E>}
   */
  map(tag) {
    return new Tagged(this, tag)
  }
}

export const nofx = none

/**
 * Creates an effect that will execute a given task and send
 * a message back to program. Provided handlers are used to turn task
 * result into message
 *
 * @template X, I, O
 * @param {import('./Task').Task<X, I>} task
 * @param {(value:I) => O|void} [ok]
 * @param {(error:X) => O|void} [error]
 */
export const fx = (task, ok = nothing, error = warn) /*: Effect<message> */ =>
  new FX(task, ok, error)

/**
 * Sends a given message to the program
 *
 * @template T
 * @param {T} message
 */
export const send = message => new Send(message)

/**
 * @template T
 * @param  {Effect<T>[]} fx
 */
export const batch = (...fx) => new Batch(fx)

/**
 * @param {unknown} error
 */
const warn = error => {
  console.warn("Task failed but error was not handled", error)
}
