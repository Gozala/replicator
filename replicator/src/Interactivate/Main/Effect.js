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

  const file = { path: "code.js", content: new Blob([content]) }
  const data = await ipfs.add(file, {
    wrapWithDirectory: true,
  })

  console.log({ data })

  const { value: original } = await ipfs.dag.get(cid)
  console.log({ original })

  // @ts-ignore
  original.rmLink("data")
  // @ts-ignore
  original.addLink({
    Name: "data",
    Hash: data.cid,
    Tsize: data.size,
  })

  const fork = await ipfs.block.put(original.serialize())

  const forkURL = new URL(`/ipfs/${fork.cid}`, url)

  try {
    history.pushState(null, "", forkURL.toString())
  } catch (e) {
    window.open(forkURL.toString())
  }
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
