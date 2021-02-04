/**
 * @param {URL} url
 */
export const load = (url /*:URL*/) =>
  /**
   * @returns {Promise<import('./Notebook').Doc>}
   */
  async () => {
    return { url, content: 'show: "Hello"\n', isOwner: true }
  }
