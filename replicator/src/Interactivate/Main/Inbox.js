import { always } from "../../../modules/reflex/src/Basics.js"
/**
 * @typedef {import('../Notebook').Message} NotebookMessage
 *
 * @typedef {never
 * | { tag: "navigate", value:URL }
 * | { tag: "load", value:URL }
 * | { tag: "navigated", value:URL }
 * } Route
 *
 * @typedef {never
 * | { tag: "route", value: Route }
 * | { tag: "notebook", value: NotebookMessage }
 * | { tag: "save", value:true }
 * | { tag: "published", value:URL }
 * | { tag: "saved", value:true }
 * | { tag: "saveError", value:Error }
 * } Message
 */

/**
 *
 * @param {NotebookMessage} value
 * @returns {Message}
 */
export const notebook = (value) => ({
  tag: "notebook",
  value,
})

/**
 *
 * @param {Route} value
 * @returns {Message}
 */
export const route = (value) => ({
  tag: "route",
  value,
})

/** @type {() => Message} */
export const onSaved = always({ tag: "saved", value: true })

/**
 *
 * @param {Error} value
 * @returns {Message}
 */
export const onSaveError = (value) => ({
  tag: "saveError",
  value,
})

/**
 *
 * @param {URL} value
 * @returns {Message}
 */
export const onPublished = (value /*: URL*/) => ({
  tag: "published",
  value,
})

/**
 * @param {URL} value
 * @returns {Message}
 */
export const onInternalURLRequest = (value) => route({ tag: "navigate", value })

/**
 * @param {URL} value
 * @returns {Message}
 */
export const onExternalURLRequest = (value) => route({ tag: "load", value })

/**
 * @param {URL} value
 * @returns {Message}
 */
export const onURLChange = (value) => route({ tag: "navigated", value })
