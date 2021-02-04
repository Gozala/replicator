import { nofx, fx, send, batch } from "../../modules/reflex/src/Effect.js"
import { article, header, div, form } from "../../modules/reflex/src/Element.js"
import { className } from "../../modules/reflex/src/Attribute.js"
import { unreachable } from "../../modules/reflex/src/Basics.js"

import * as Notebook from "./Notebook/Notebook.js"
import * as Data from "./Notebook/Data.js"
import * as Inbox from "./Notebook/Inbox.js"
import { keyedNode } from "../../modules/reflex/src/VirtualDOM.js"
import * as Cell from "./Cell.js"
import * as Effect from "./Notebook/Effect.js"

/**
 * @returns {Notebook.State}
 */
export const init = () => {
  const state = Data.init(null, true, `show: "Hello"`)
  const selection = Data.selection(state)
  if (selection) {
    const [id, cell] = selection
    const [cell2, fx] = Cell.setSelection(-1, id, cell)
    const state2 = Data.replaceCell(id, cell2, state)
    return [state2, fx.map(Inbox.onCell(id))]
  } else {
    return [state, nofx]
  }
}

/**
 * @param {URL} url
 * @returns {Notebook.State}
 */
export const load = (url) => [
  Data.load(url),
  fx(Effect.load(url), Inbox.onLoaded, Inbox.onLoadError),
]

/**
 *
 * @param {URL} [url]
 */
export const open = (url /*:?URL*/) => (url ? load(url) : init())

/**
 *
 * @param {Notebook.Message} message
 * @param {Notebook.Model} state
 * @returns {Notebook.State}
 */
export const update = (message, state) => {
  switch (message.tag) {
    case "onLoaded": {
      const { url, content, isOwner } = message.value
      const state = Data.init(url, isOwner, content)
      const id = Data.firstID(state)
      return [state, id ? send(Inbox.execute(id)) : nofx]
    }
    case "onLoadError": {
      return [Data.failLoad(state), nofx]
    }
    case "onCell": {
      const [id, payload] = message.value
      return updateCell(state, id, payload)
    }
    case "onCellChanged": {
      const id = message.value
      const nextID = Data.idByOffset(1, id, state)
      return [state, nextID ? send(Inbox.execute(nextID)) : nofx]
    }
    default: {
      return unreachable(message)
    }
  }
}

/**
 *
 * @param {Notebook.Model} state
 * @param {Notebook.ID} id
 * @param {Notebook.Cell.Message} message
 * @returns {Notebook.State}
 */
const updateCell = (state, id, message) => {
  switch (message.tag) {
    case "output":
    case "change": {
      const cell = Data.cellByID(id, state)
      if (cell) {
        const [cell2, fx] = Cell.update(message, cell)
        return [Data.replaceCell(id, cell2, state), fx.map(Inbox.onCell(id))]
      } else {
        return [state, nofx]
      }
    }
    case "insert": {
      return [Data.insert(id, 1, message.value, state), nofx]
    }
    case "focus": {
      return [Data.selectByID(id, state), nofx]
    }
    case "leave": {
      return setSelection(message.value, state)
    }
    case "execute": {
      const targetCell = Data.cellByID(id, state)
      if (targetCell) {
        const [cell, fx] = Cell.update(message, targetCell)
        const data = Data.replaceCell(id, cell, state)
        return [data, fx.map(Inbox.onCell(id))]
      } else {
        return [state, nofx]
      }
    }
    case "split": {
      const targetCell = Data.cellByID(id, state)
      if (targetCell) {
        const [cell, fx] = Cell.update(message, targetCell)
        let data = Data.replaceCell(id, cell, state)

        data =
          targetCell === Data.lastCell(state)
            ? Data.append([{ input: "" }], data)
            : data

        if (targetCell === Data.selectedCell(state)) {
          const [next, fx2] = setSelection(1, data)
          return [next, batch(fx.map(Inbox.onCell(id)), fx2)]
        } else {
          return [data, fx.map(Inbox.onCell(id))]
        }
      } else {
        return [state, nofx]
      }
    }
    case "remove": {
      const [data, fx] = setSelection(message.value, state)
      return [Data.removeCells([id], data), fx]
    }
    case "join": {
      return [Data.joinCell(id, message.value, state), nofx]
    }
    case "print": {
      return [state, nofx]
    }
    default: {
      return unreachable(message)
    }
  }
}

/**
 *
 * @param {Notebook.Direction} dir
 * @param {Notebook.Model} state
 * @returns {Notebook.State}
 */
const setSelection = (dir, state) => {
  let data = Data.changeCellSelection(dir, true, state)
  const selection = Data.selection(data)
  if (selection) {
    const [id, cell] = selection
    const [cell2, fx] = Cell.setSelection(dir, id, cell)
    return [Data.replaceCell(id, cell2, data), fx.map(Inbox.onCell(id))]
  } else {
    return [data, nofx]
  }
}

/**
 * @param {Notebook.Model} state
 * @returns {Notebook.View}
 */
export const view = (state /*:Model*/) =>
  form(
    [className(`w-100 h-100 load ${state.status}`)],
    [
      article(
        [className(`w-100 h-100 ph3 overflow-container center bg-white`)],
        [viewHeader(state), viewDocument(state)]
      ),
      div([className(`progress`)]),
    ]
  )

/**
 * @param {Notebook.Model} _state
 * @returns {Notebook.View}
 */
const viewHeader = (_state) =>
  header(
    [
      className(
        "flex justify-between measure-wide-ns items-center-ns items-top pl2-ns mw-100"
      ),
    ],
    [
      // picture(
      //   [className("inline-flex")],
      //   [
      //     source([srcset("dat://gozala.hashbase.io/profile.jpeg")]),
      //     source([srcset("./icons/fontawesome/svgs/solid/user.svg")]),
      //     img([className("br-100 h3 w3 mw3 dib")])
      //   ]
      // ),
      // div(
      //   [className("w-100 pl2 pl3-ns f6")],
      //   [
      //     a(
      //       [className("flex items-center no-underline black hover-blue")],
      //       [text("Irakli Gozalishvili")]
      //     ),
      //     div(
      //       [className("mt1 lh-copy black-50")],
      //       [
      //         text(
      //           "Curios tinkerer at Mozilla that fancies functional paradigm. Environmentalist; Husband; Father; LISPer with recently developed interest in static type systems."
      //         )
      //       ]
      //     )
      //   ]
      // ),
      // div([className("dtc v-mid")])
    ]
  )

/**
 * @param {Notebook.Model} state
 */
const viewDocument = (state) =>
  keyedNode(
    "main",
    [className("relative mh0-ns nr3 nl3 mt4 mb4")],
    Data.cells(state).map(viewCell)
  )

/**
 * @param {[string, Notebook.Cell.Model, boolean]} state
 * @returns {[string, Notebook.View]}
 */
const viewCell = ([key, cell, focused]) => [
  key,
  Cell.view(cell, `cell-${key}`, focused).map(Inbox.onCell(key)),
]
