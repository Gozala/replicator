import * as Main from "./Main.js"
import * as Notebook from "../Notebook/Data.js"
import { always } from "../../../modules/reflex/src/Basics.js"

const saving = always(/** @type {Main.SaveRequest} */ ({ tag: "Saving" }))
const notSaving = always(/** @type {Main.SaveRequest} */ ({ tag: "NotSaving" }))

/**
 *
 * @param {Error} error
 * @returns {Main.SaveRequest}
 */
const savingFailed = (error /*:Error*/) => ({
  tag: "SavingFailed",
  value: error,
})

/**
 *
 * @param {Main.Notebook.Model} notebook
 * @returns {Main.Model}
 */
export const init = (notebook) => ({
  saveRequest: { tag: "NotSaving" },
  notebook: { before: notebook, after: notebook },
})

/**
 * @param {Main.Model} state
 * @returns {Main.Model}
 */
export const saved = (state) => ({
  ...state,
  saveRequest: notSaving(),
})

/**
 *
 * @param {URL} url
 * @param {Main.Model} state
 * @returns {Main.Model}
 */
export const published = (url, state) => ({
  ...updateNotebook(state, Notebook.updateURL(url, true, notebook(state))),
  saveRequest: notSaving(),
})

/**
 *
 * @param {Error} error
 * @param {Main.Model} state
 * @returns {Main.Model}
 */
export const saveFailed = (error, state) => ({
  ...state,
  saveRequest: savingFailed(error),
})

/**
 * @param {Main.Model} state
 * @returns {Main.Model}
 */
export const save = (state) => ({
  ...state,
  saveRequest: saving(),
  notebook: { before: state.notebook.after, after: state.notebook.after },
})

/**
 * @param {Main.Model} state
 * @param {Main.Notebook.Model} notebook
 * @returns {Main.Model}
 */
export const updateNotebook = (state, notebook) => {
  const { before } = state.notebook
  const notebookBefore = before.status !== notebook.status ? notebook : before

  return {
    ...state,
    notebook: { before: notebookBefore, after: notebook },
  }
}

/**
 * @param {Main.Model} state
 * @returns {Main.Notebook.Model}
 */
export const notebook = (state) => state.notebook.after

/**
 * @param {Main.Model} state
 * @returns {boolean}
 */
export const isModified = (state) =>
  Notebook.textInput(state.notebook.before) !==
  Notebook.textInput(state.notebook.after)

/**
 * @param {Main.Model} state
 * @returns {URL|null}
 */
export const toURL = (state) => notebook(state).url

/**
 * @param {Main.Model} state
 * @returns {string}
 */
export const toText = (state) => Notebook.textInput(notebook(state))

/**
 * @param {Main.Model} state
 * @returns {boolean}
 */
export const isOwner = (state) => notebook(state).isOwner

/**
 * @param {Main.Model} state
 * @returns {string}
 */
export const status = (state) => {
  switch (state.saveRequest.tag) {
    case "NotSaving": {
      return isModified(state) ? "" : "published"
    }
    case "Saving": {
      return "publishing"
    }
    case "SavingFailed": {
      return "retry"
    }
    default: {
      return "unknown"
    }
  }
}
