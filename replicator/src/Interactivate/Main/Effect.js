import { navigate, load } from "../../Effect/Navigation.js"
import * as IPFS from "../../Service/IPFS.js"
import { deriveCID } from "../Notebook/Data.js"

/**
 * @param {URL} url
 * @param {string} content
 * @param {Object} [_options]
 * @param {number} [_options.timeout]
 */
export const save = (url, content, _options = {}) => async () => {
  const result = deriveCID(url)
  const cid = result ? new IPFS.CID(result) : null
  console.log({ cid })

  const ipfs = await IPFS.use()
  console.log({ ipfs })

  if (!cid) {
    throw Error(`Unable to figure out CID from ${url}`)
  }

  const data = await ipfs.add(new File([content], "code.js"), {
    wrapWithDirectory: true,
  })

  console.log({ data })

  const original = await ipfs.dag.get(cid)
  console.log({ original })

  const fork = await ipfs.dag.put({ ...original, data })
  console.log({ fork })

  const forkURL = new URL(`/ipfs/${fork}`, url)

  try {
    history.pushState(null, "", forkURL.toString())
  } catch (e) {}

  return fork
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
