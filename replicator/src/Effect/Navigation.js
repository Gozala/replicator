const STATE = {}
const NAV = { type: "navigate" }

const { history, location } = window.top
const dispatch = () => {
  // @ts-ignore
  if (window.top.onnavigate) {
    // @ts-ignore
    window.top.onnavigate.handleEvent(NAV)
  }
}

/**
 * @param {URL} url
 */
export const navigate = (url) => async () => {
  if (location.href != url.href) {
    history.pushState(STATE, "", `${url}`)
    dispatch()
  }
}

/**
 * @param {URL} url
 */
export const replaceURL = (url) => async () => {
  if (location.href != url.href) {
    history.replaceState(STATE, "", `${url}`)
    dispatch()
  }
}

/**
 * @param {number} n
 */
export const back = (n) => async () => {
  window.top.history.go(-1 * n)
}

/**
 * @param {number} n
 */
export const forward = (n) => async () => {
  window.top.history.go(n)
}

/**
 * @param {URL} url
 */
export const load = (url) => async () => {
  try {
    // @ts-ignore
    window.top.location = url
  } catch (error) {
    window.top.location.reload(false)
  }
}

export const reload = () => async () => {
  window.top.location.reload(false)
}

export const reloadAndSkipCache = () => async () => {
  window.top.location.reload(true)
}
