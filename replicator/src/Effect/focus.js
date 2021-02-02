/**
 * @param {string} id
 */
export const focus = (id) => async () => {
  const element = document.getElementById(id)
  if (element != null) {
    element.focus()
  } else {
    throw Error(`Element with #${id} not found`)
  }
}
