/**
 * @typedef {() => void} Run
 */

/**
 * @template ID, P, Info
 * @typedef {(job:(info:Info) => void, p:P) => ID} Enqueue
 */

/**
 * @template ID
 * @typedef {(id:ID) => void} Abort
 */

/**
 * @template ID, P, Info
 */
class Scheduler {
  /**
   *
   * @param {Enqueue<ID, P, Info>} enqueue
   * @param {Abort<ID>} abort
   */
  constructor(enqueue, abort) {
    this.enqueue = enqueue
    this.abort = abort
  }

  /**
   * @template CTX
   * @param {(ctx:CTX, info:Info) => void} perform
   * @param {P} param
   * @returns {(ctx:CTX) => void}
   */
  debounce(perform, param) {
    const { enqueue, abort } = this
    /** @type {null|ID} */
    let token = null
    /** @type {CTX} */
    let context
    /**
     * @param {Info} detail
     */
    const run = (detail) => {
      token = null
      perform(context, detail)
    }

    /**
     * @param {CTX} arg
     */
    return (arg) => {
      if (token != null) {
        abort(token)
      }
      context = arg
      token = enqueue(run, param)
    }
  }
}

/**
 * @typedef {{didTimeout: boolean, timeRemaining(): number}} IdleInfo
 */

/**
 * @type {Scheduler<unknown, void|{timeout:number}, IdleInfo>}
 */
export const idle = new Scheduler(
  // @ts-ignore
  top.requestIdleCallback,
  // @ts-ignore
  top.cancelIdleCallback
)

/** @type {Scheduler<number, undefined|number, void>} */
export const timeout = new Scheduler(top.setTimeout, top.clearTimeout)

/** @type {Scheduler<number, void,  DOMHighResTimeStamp>} */
export const animation = new Scheduler(
  top.requestAnimationFrame,
  top.cancelAnimationFrame
)
