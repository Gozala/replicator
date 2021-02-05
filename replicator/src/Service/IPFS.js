import IPFS from "../../modules/ipfs-core/index.js"

export const CID = IPFS.CID
export const use =
  /**
   * @returns {Promise<IPFS>}
   */

  async () => {
    // @ts-ignore
    const context = /** @type {{ipfs: null|Promise<IPFS>|IPFS}} */ (globalThis)
    const ipfs = context.ipfs
    if (ipfs == null) {
      const node = IPFS.create()
      context.ipfs = node
      const ipfs = await node
      context.ipfs = ipfs
      return ipfs
    } else {
      return await ipfs
    }
  }

export const start = () => async () => {
  await use()
}
