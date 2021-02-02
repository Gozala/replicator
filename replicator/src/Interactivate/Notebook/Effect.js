export const load = (url /*:URL*/) => async () => {
  const content = await Dat.readFile(url)
  const { isOwner } = await Dat.getInfo(url)
  return { url, content, isOwner }
}
