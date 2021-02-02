// @flow strict

import * as Notebook from "../Notebook/Data.js"
import { always } from "../../../modules/reflex/src/Basics.js"

/**
 * @typedef {{
 *   notebook: MaybeSaved<Notebook.Model>;
 *   saveRequest:SaveRequest;
 * }} Model
 *
 * @typedef {never
 * | { tag: "NotSaving" }
 * | { tag: "Saving" }
 * | { tag: "SavingFailed", value:Error }
 * } SaveRequest
 */

/**
 * @template Doc
 * @typedef {{before:Doc; after:Doc;}} MaybeSaved<Doc>
 */

const saving = always({ tag: "Saving" })
const notSaving = always({ tag: "NotSaving" })
const savingFailed = (error /*:Error*/) => ({
  tag: "SavingFailed",
  value: error,
})

export const init = (notebook /*:Notebook.Model*/) /*:Model*/ => ({
  saveRequest: { tag: "NotSaving" },
  notebook: { before: notebook, after: notebook },
})

export const saved = (state /*:Model*/) /*:Model*/ => ({
  ...state,
  saveRequest: notSaving(),
})

export const published = (url /*:URL*/, state /*:Model*/) /*:Model*/ => ({
  ...updateNotebook(state, Notebook.updateURL(url, true, notebook(state))),
  saveRequest: notSaving(),
})

export const saveFailed = (error /*:Error*/, state /*:Model*/) /*:Model*/ => ({
  ...state,
  saveRequest: savingFailed(error),
})

export const save = (state /*:Model*/) /*:Model*/ => ({
  ...state,
  saveRequest: saving(),
  notebook: { before: state.notebook.after, after: state.notebook.after },
})

export const updateNotebook = (
  state /*:Model*/,
  notebook /*:Notebook.Model*/
) /*:Model*/ => {
  const { before } = state.notebook
  const notebookBefore = before.status !== notebook.status ? notebook : before

  return {
    ...state,
    notebook: { before: notebookBefore, after: notebook },
  }
}

export const notebook = (state /*:Model*/) /*:Notebook.Model*/ =>
  state.notebook.after

export const isModified = (state /*:Model*/) /*:boolean*/ =>
  Notebook.textInput(state.notebook.before) !==
  Notebook.textInput(state.notebook.after)

export const toURL = (state /*:Model*/) /*:?URL*/ => notebook(state).url

export const toText = (state /*:Model*/) /*:string*/ =>
  Notebook.textInput(notebook(state))

export const isOwner = (state /*:Model*/) /*:boolean*/ =>
  notebook(state).isOwner

export const status = (state /*:Model*/) /*:string*/ => {
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
