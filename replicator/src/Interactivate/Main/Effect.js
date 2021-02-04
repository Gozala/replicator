// @flow strict

import { navigate, load } from "../../Effect/Navigation.js"

/**
 * @param {URL} url
 * @param {string} content
 * @param {Object} [options]
 * @param {number} [options.timeout]
 */
export const save = (url, content, options = {}) => async () => {
  console.log({ save: { url, content, options } })
}

/**
 * @param {string} content
 * @param {URL|null} [origin]
 */
export const saveAs = (content, origin) =>
  /**
   * @returns {Promise<URL>}
   */
  async () => {
    console.log({ saveAs: { content, origin } })
    throw Error("Not implemented")
  }

export { navigate, load }
