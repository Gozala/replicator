// @flow strict

import * as Inbox from "../Cell/Inbox.js"
/**
 * @typedef {import('./Data').ID} ID
 * @typedef {never
 * | { tag: "onLoaded", value: {content:string, url:URL, isOwner:boolean } }
 * | { tag: "onLoadError", value:Error }
 * | { tag: "onCell", value:[ID, Inbox.Message] }
 * | { tag: "onCellChanged", value:ID }
 * } Message
 */

const route = (message /*:Message*/) => {}

export const onCell = (key /*:ID*/) => (
  value /*:Inbox.Message*/
) /*:Message*/ => {
  switch (value.tag) {
    case "print": {
      return { tag: "onCellChanged", value: key }
    }
    default: {
      return { tag: "onCell", value: [key, value] }
    }
  }
}

export const onLoaded = (
  value /*:{content:string, url:URL, isOwner:boolean }*/
) => ({
  tag: "onLoaded",
  value,
})

export const onLoadError = (value /*:Error*/) => ({
  tag: "onLoadError",
  value,
})

export const execute = (key /*:ID*/) /*:Message*/ => ({
  tag: "onCell",
  value: [key, Inbox.execute()],
})
