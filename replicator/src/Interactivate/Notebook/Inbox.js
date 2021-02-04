// @flow strict

import * as Notebook from "./Notebook.js"
import * as Inbox from "../Cell/Inbox.js"

/**
 * @param {Notebook.ID} key
 */
export const onCell = (key) =>
  /**
   * @param {Notebook.Cell.Message} value
   * @returns {Notebook.Message}
   */
  (value) => {
    switch (value.tag) {
      case "print": {
        return { tag: "onCellChanged", value: key }
      }
      default: {
        return { tag: "onCell", value: [key, value] }
      }
    }
  }

/**
 * @param {Notebook.Doc} value
 * @returns {Notebook.Message}
 */
export const onLoaded = (value) => ({
  tag: "onLoaded",
  value,
})

/**
 *
 * @param {Error} value
 * @returns {Notebook.Message}
 */
export const onLoadError = (value) => ({
  tag: "onLoadError",
  value,
})

/**
 * @param {Notebook.ID} key
 * @returns {Notebook.Message}
 */
export const execute = (key) => ({
  tag: "onCell",
  value: [key, Inbox.execute()],
})
