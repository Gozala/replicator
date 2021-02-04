// @flow strict

import { on } from "../../modules/reflex/src/VirtualDOM.js"
import { section, customElement } from "../../modules/reflex/src/Element.js"
import {
  className,
  property,
  tabIndex,
  id,
} from "../../modules/reflex/src/Attribute.js"
import { unreachable } from "../../modules/reflex/src/Basics.js"
import { nofx, fx, send, batch } from "../../modules/reflex/src/Effect.js"
import InspectBlock from "../Element/InspectBlock.js"
import CodeBlock from "../Element/CodeBlock.js"

import * as Data from "./Cell/Data.js"
import * as Inbox from "./Cell/Inbox.js"
import * as Decoder from "./Cell/Decoder.js"
import * as Effect from "./Cell/Effect.js"
import * as Cell from "./Cell/Cell.js"

/**
 *
 * @param {Cell.Message} message
 * @param {Cell.Model} state
 * @returns {Cell.State}
 */
export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "change": {
      const { value } = message
      const cell = Data.updateInput(value, state)
      const tokens = Data.tokenize(value)
      switch (tokens.length) {
        case 0: {
          return [cell, send(Inbox.join(1))]
        }
        case 1: {
          return [cell, nofx]
        }
        default: {
          const [token, ...rest] = tokens
          const inserts = []
          for (const input of rest) {
            inserts.push({ input })
          }
          const replace = send(Inbox.change(/** @type {string} */ (token)))
          const insert = send(Inbox.insert(inserts))
          return [cell, batch(replace, insert)]
        }
      }
    }
    case "join": {
      return [state, nofx]
    }
    case "leave": {
      return [state, nofx]
    }
    case "execute":
    case "split": {
      return [
        state,
        fx(Effect.evaluate(state.id, state.input), Inbox.output, Inbox.output),
      ]
    }
    case "focus": {
      return [state, nofx]
    }
    case "output": {
      return [Data.updateOutput(message.value, state), send(Inbox.print())]
    }
    case "insert": {
      return [state, nofx]
    }
    case "remove": {
      return [state, nofx]
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
 * @param {Cell.Direction} direction
 * @param {string} id
 * @param {Cell.Model} model
 * @returns {Cell.State}
 */
export const setSelection = (direction, id, model) => {
  return [model, fx(Effect.setSelection(`cell-${id}`, direction))]
}

/**
 * @param {Cell.Model} model
 * @param {string} key
 * @param {boolean} focused
 * @returns {Cell.View}
 */
export const view = ({ input, output }, key, focused) =>
  section(
    [className(`cell bl ${focused ? "b--silver" : "b--transparent"}`)],
    [viewCodeBlock(input, key), viewOutput(output, key)]
  )

/**
 * @param {Cell.Output|undefined} result
 * @param {string} _key
 * @returns {Cell.View}
 */
const viewOutput = (result, _key) =>
  customElement("inspect-block", InspectBlock, [
    className("flex"),
    property("target", result),
  ])

/**
 * @param {string} input
 * @param {string} key
 * @returns {Cell.View}
 */
const viewCodeBlock = (input, key) =>
  customElement("code-block", CodeBlock, [
    id(key),
    property("source", input),
    tabIndex(0),
    on("focus", Decoder.focus),
    on("change", Decoder.change),
    on("escape", Decoder.escape),
    on("split", Decoder.split),
    on("delete", Decoder.remove),
  ])
