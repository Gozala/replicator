import { always } from "../../../modules/reflex/src/Basics.js"
import * as Main from "./Main.js"

/**
 *
 * @param {Main.Notebook.Message} value
 * @returns {Main.Message}
 */
export const notebook = (value) => ({
  tag: "notebook",
  value,
})

/**
 *
 * @param {Main.Route} value
 * @returns {Main.Message}
 */
export const route = (value) => ({
  tag: "route",
  value,
})

/** @type {() => Main.Message} */
export const onSaved = always({ tag: "saved", value: true })

/**
 *
 * @param {Error} value
 * @returns {Main.Message}
 */
export const onSaveError = (value) => ({
  tag: "saveError",
  value,
})

/**
 *
 * @param {URL} value
 * @returns {Main.Message}
 */
export const onPublished = (value /*: URL*/) => ({
  tag: "published",
  value,
})

/**
 * @param {URL} value
 * @returns {Main.Message}
 */
export const onInternalURLRequest = (value) => route({ tag: "navigate", value })

/**
 * @param {URL} value
 * @returns {Main.Message}
 */
export const onExternalURLRequest = (value) => route({ tag: "load", value })

/**
 * @param {URL} value
 * @returns {Main.Message}
 */
export const onURLChange = (value) => route({ tag: "navigated", value })
