const archives /*:{[string]:Archive}*/ = {}
const none /*:Object*/ = Object.freeze({})

export const load = (url /*:URL*/) /*:Promise<Archive>*/ => async () => {
  const { protocol, host } = url
  const archive = archives[host]
  if (archive) {
    return archive
  } else {
    const archive /*:Archive*/ = await DatArchive.load(`${protocol}//${host}`)
    archives[host] = archive
    return archive
  }
}

export const select = (options /*:?Select*/) => async () => {
  const archive = await DatArchive.selectArchive(options)
  const url = new URL(archive.url)
  archives[url.host] = archive
  return url
}

export const getInfo = (
  url /*:URL*/,
  options /*::?:Timeout*/
) => async () /*:Promise<ArchiveInfo>*/ => {
  const archive = await load(url)
  const info = await archive.getInfo(options)
  return info
}

export const stat = (
  url /*:URL*/,
  options /*::?:Timeout*/
) => async () /*: Promise<Stat>*/ => {
  const archive = await load(url)
  const stat = await archive.stat(url.pathname, options)
  return stat
}
export const readFile = async (
  url /*:URL*/,
  options /*::?: { encoding: Encoding, timeout?: number }*/
) => async () => {
  const archive = await load(url)
  const content = await archive.readFile(url.pathname, options)
  return content
}
export const writeFile = async (
  url /*:URL*/,
  content /*:string*/,
  options /*::?: { encoding: Encoding, timeout?: number }*/
) => async () => {
  const archive = await load(url)
  await archive.writeFile(url.pathname, content, options)
}
export const readFileBuffer = async (
  url /*:URL*/,
  options /*:Timeout*/ = none
) => async () => {
  const archive = await load(url)
  const { timeout } = options
  const buffer = await archive.readFile(url.pathname, {
    encoding: "binary",
    timeout,
  })
  return buffer
}
export const writeFileBuffer = async (
  url /*:URL*/,
  buffer /*:ArrayBuffer*/,
  options /*:Timeout*/ = none
) => async () => {
  const archive = await load(url)
  const { timeout } = options
  await archive.writeFile(url.pathname, buffer, {
    encoding: "binary",
    timeout,
  })
}
export const removeFile = async (
  url /*:URL*/,
  options /*:Timeout*/ = none
) => async () => {
  const archive = await load(url)
  await archive.unlink(url.pathname)
}
export const readDirectoryPaths = async (
  url /*:URL*/,
  path /*:string*/,
  options /*: { recursive?: boolean, timeout?: number }*/ = none
) => async () => {
  const archive = await load(url)
  const { recursive, timeout } = options
  return await archive.readdir(url.pathname, {
    recursive,
    timeout,
    stat: false,
  })
}
export const readDirectoryEntries = async (
  url /*:URL*/,
  options /*:{ recursive?: boolean, timeout?: number }*/ = none
) => async () => {
  const archive = await load(url)
  const { recursive, timeout } = options
  return await archive.readdir(url.pathname, { recursive, timeout, stat: true })
}
export const removeDirectory = async (
  url /*:URL*/,
  options /*::?:{recursive:boolean}*/
) => async () => {
  const archive = await load(url)
  await archive.rmdir(url.pathname, options)
}
export const move = async (
  from /*:URL*/,
  to /*:URL*/,
  options /*:Timeout*/ = none
) => async () => {
  const source = await load(from)
  if (from.host === to.host) {
    await source.rename(from.pathname, to.pathname, options)
  } else {
    const { timeout } = options
    const target = await load(to)
    const config = { encoding: "binary", options }
    const buffer = await source.readFile(from.pathname, config)
    await target.writeFile(to.pathname, buffer, config)
    source.unlink(from.pathname)
  }
}
export const copy = async (
  from /*:URL*/,
  to /*:URL*/,
  options /*:Timeout*/ = none
) => async () => {
  const source = await load(from)
  if (from.host === to.host) {
    await source.copy(from.pathname, to.pathname, options)
  } else {
    const { timeout } = options
    const target = await load(to)
    const config = { encoding: "binary", options }
    const buffer = await source.readFile(from.pathname, config)
    await target.writeFile(to.pathname, buffer, config)
  }
}
