// @flow strict

import { attribute, property, style, on } from "./VirtualDOM.js"

export { style, attribute, property, on }
// // TODO: defaultValue, defaultChecked, innerHTML, suppressContentEditableWarning, suppressHydrationWarning, style

/**
 * @template {string|number|boolean} T
 * @param {T} value
 */
export const defaultValue = value => property("defaultValue", value)

/**
 * @template {string|number|boolean} T
 * @param {T} value
 */
export const value = value => property("value", value)

/**
 * @template {string} T
 * @param {T} value
 */
export const acceptCharset = value => property("accept-charset", value)

/**
 * @template {string} T
 * @param {T} value
 */
export const className = value => attribute("class", value)

/**
 * @param  {string[]} values
 */
export const classList = (...values) => attribute("class", values.join(" "))

/**
 *
 * @param {string} value
 */
export const textContent = value => property("textContent", value)

/**
 * @param {string} value
 */
export const For = value => attribute("for", value)

/**
 * @param {string} value
 */
export const Equiv = value => attribute("equiv", value)

/**
 * @param {string} name
 * @param {string} value
 */
export const data = (name, value) => attribute(`data-${name}`, value)

/**
 * @param {string} name
 */
const setHTMLAttribute = name =>
  /**
   * @param {string} [value]
   */
  (value = "") => attribute(name, value)

export const src = setHTMLAttribute("src")
export const srcset = setHTMLAttribute("srcset")
export const alt = setHTMLAttribute("alt")
export const href = setHTMLAttribute("href")
export const id = setHTMLAttribute("id")
export const accept = setHTMLAttribute("accept")
export const type = setHTMLAttribute("type")
export const placeholder = setHTMLAttribute("placeholder")
export const title = setHTMLAttribute("title")

/**
 * @param {string} name
 */
const setBooleanHTMLAttribute = name =>
  /**
   * @param {boolean} value
   */
  value => attribute(name, value ? "true" : "false")

export const contentEditable = setBooleanHTMLAttribute("contenteditable")
export const draggable = setBooleanHTMLAttribute("draggable")
export const spellCheck = setBooleanHTMLAttribute("spellcheck")

/**
 * @param {string} name
 */
const setBooleanSVGAttribute = name =>
  /**
   * @param {boolean} value
   */
  value => attribute(name, value ? "true" : "false")

export const autoReverse = setBooleanSVGAttribute("autoReverse")
export const externalResourcesRequired = setBooleanSVGAttribute(
  "externalResourcesRequired"
)
export const preserveAlpha = setBooleanSVGAttribute("preserveAlpha")

/**
 *
 * @param {string} name
 */
const setModalHTMLAttribute = name =>
  /**
   *
   * @param {boolean} [value]
   */
  (value = true) => attribute(name, value ? "" : null)

export const allowFullScreen = setModalHTMLAttribute("allowfullscreen")
export const async = setModalHTMLAttribute("async")
export const autoFocus = setModalHTMLAttribute("autofocus")
export const autoPlay = setModalHTMLAttribute("autoplay")
export const controls = setModalHTMLAttribute("controls")
export const htmlDefault = setModalHTMLAttribute("default")
export const defer = setModalHTMLAttribute("defer")
export const disabled = setModalHTMLAttribute("disabled")
export const formNoValidate = setModalHTMLAttribute("formnovalidate")
export const hidden = setModalHTMLAttribute("hidden")
export const loop = setModalHTMLAttribute("loop")
export const noValidate = setModalHTMLAttribute("novalidate")
export const open = setModalHTMLAttribute("open")
export const playsInline = setModalHTMLAttribute("playsinline")
export const readOnly = setModalHTMLAttribute("readonly")
export const required = setModalHTMLAttribute("required")
export const reversed = setModalHTMLAttribute("reversed")
export const scoped = setModalHTMLAttribute("scoped")
export const seamless = setModalHTMLAttribute("seamless")
export const itemScope = setModalHTMLAttribute("itemscope")

/**
 * @param {string} name
 */
const setBooleanProperty = name =>
  /**
   *
   * @param {boolean} value
   */
  value => property(name, value)

export const checked = setBooleanProperty("checked")
export const multiple = setBooleanProperty("multiple")
export const muted = setBooleanProperty("muted")
export const selected = setBooleanProperty("selected")

/**
 * @param {string} name
 */
const setOptionalStringAttribute = name =>
  /**
   *
   * @param {string} [value]
   */
  (value = "") => attribute(name, value)

export const capture = setOptionalStringAttribute("capture")
export const download = setOptionalStringAttribute("download")

/**
 * @param {string} name
 */
const setNumberAttribute = name =>
  /**
   * @param {number} value
   */
  value => attribute(name, `${value}`)

export const cols = setNumberAttribute("cols")
export const rows = setNumberAttribute("rows")
export const size = setNumberAttribute("size")
export const span = setNumberAttribute("span")
export const tabIndex = setNumberAttribute("tabindex")

export const rowSpan = setNumberAttribute("rowSpan")
export const start = setNumberAttribute("start")
