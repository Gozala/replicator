// @flow strict

import { navigate, load } from "../../Effect/Navigation.js"
import { writeFile } from "../../Effect/dat.js"

export const save = writeFile

/**
 * @param {string} content
 * @param {URL} [origin]
 */
export const saveAs = (content, origin) => async () => {
  const name = origin
    ? origin.pathname.substr(origin.pathname.lastIndexOf("/") + 1)
    : "stratchpad.js"
  const encoder = new TextEncoder()
  return await library.saveFileAs(name, encoder.encode(content).buffer)
}

export { navigate, load }
