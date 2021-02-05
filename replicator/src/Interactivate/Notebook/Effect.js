/**
 * @param {URL} url
 */
export const load = (url) =>
  /**
   * @returns {Promise<import('./Notebook').Doc>}
   */
  async () => {
    const response = await fetch(url.toString())
    const content = await response.text()
    return { url, content, isOwner: true }
  }
