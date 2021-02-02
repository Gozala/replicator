// @ts-nocheck

const TEXT = "VirtualDOM.Text"
const NODE = "VirtualDOM.Node"
const KEYED_NODE = "VirtualDOM.Keyed.Node"
const CUSTOM_NODE = "VirtualDOM.Custom"
const CUSTOM_ELEMENT = "VirtualDOM.CustomElement"
const TAGGED_NODE = "VirtualDOM.Tagger"
const THUNK_NODE = "VirtualDOM.Thunk"

const OP_REDRAW = "VirtualDOM.OP.Redraw"
const OP_THUNK = "VirtualDOM.OP.Thunk"
const OP_TAGGER = "VirtualDOM.OP.Tagger"
const OP_TEXT = "VirtualDOM.OP.Text"
const OP_FACTS = "VirtualDOM.OP.Facts"
const OP_CUSTOM = "VirtualDOM.OP.Custom"
const OP_REMOVE_LAST = "VirtualDOM.OP.RemoveLast"
const OP_APPEND = "VirtualDOM.OP.Append"
const OP_REORDER = "VirtualDOM.OP.Reorder"
const OP_REMOVE = "VirtualDOM.OP.Remove"
const OP_DELETE = "VirtualDOM.OP.Delete"
const OP_INSERT = "VirtualDOM.OP.Insert"
const OP_MOVE = "VirtualDOM.OP.Move"

const SETTING_EVENT = "VirtualDOM.Setting.Event"
const SETTING_STYLE = "VirtualDOM.Setting.Style"
const SETTING_PROPERTY = "VirtualDOM.Setting.Property"
const SETTING_ATTRIBUTE = "VirtualDOM.Setting.Attribute"
const SETTING_ATTRIBUTE_NS = "VirtualDOM.Setting.AttributeNS"

// HELPERS

function appendChild(parent, child) {
  parent.appendChild(child)
}

var init = function(virtualNode, flagDecoder, debugMetadata, args) {
  const { node } = args

  node.parentNode.replaceChild(
    render(node.ownerDocument, virtualNode, function() {}),
    node
  )

  return {}
}

// TEXT

class Text {
  constructor(content) {
    this.nodeType = TEXT
    this.text = content
  }
  map(tagger) {
    return this
  }
  toInnerHTML() {
    return ""
  }
  toOuterHTML(indent) {
    return `${indent}${this.text}`
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
}

export const text = content => new Text(content)

// NODE

const noKids = Object.freeze([])
const noFacts = Object.freeze([])

class CustomElement {
  constructor(localName, elementConstructor, options, settings) {
    this.nodeType = CUSTOM_ELEMENT
    this.localName = localName
    this.elementConstructor = elementConstructor
    this.options = options
    this.settings = settings
    this.children = noKids
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  serializeSettings(key = "") {
    return Node.prototype.serializeSettings.call(this, key)
  }
  toOuterHTML(indent = "", key = "") {
    return Node.prototype.toOuterHTML.call(this, indent, key)
  }
  toInnerHTML(indent = "") {
    return Node.prototype.toInnerHTML.call(this, indent)
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

export const customElement = (localName, constructor, settings) =>
  new CustomElement(localName, constructor, undefined, organizeFacts(settings))

class Node {
  constructor(localName, settings, children, namespace, descendantsCount) {
    this.nodeType = NODE
    this.localName = localName
    this.settings = settings
    this.children = children
    this.namespace = namespace
    this.descendantsCount = descendantsCount
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  toInnerHTML(indent = "") {
    const { children } = this
    let html = ""
    if (children.length > 0) {
      const childIndent = `${indent}  `
      for (const child of children) {
        html += `\n${child.toOuterHTML(indent, "")}`
      }
    }
    return html
  }
  serializeSettings(key) {
    let buffer = ""

    if (key !== "") {
      buffer += ` key=${key}`
    }

    const { settings } = this
    for (const type in settings) {
      const group = settings[type]
      for (const name in group) {
        const value = group[name]
        switch (type) {
          case SETTING_ATTRIBUTE: {
            buffer += ` ${name}="${value}"`
            break
          }
          case SETTING_EVENT: {
            buffer += ` on${name}`
            break
          }
          case SETTING_PROPERTY: {
            buffer += ` ${name}=${value}`
          }
        }
      }
    }

    if (this.namespace) {
      buffer += ` xmlns="${namespace}"`
    }

    return buffer
  }
  toOuterHTML(indent = "", key = "") {
    const { localName } = this
    const open = `<${localName}${this.serializeSettings(key)}>`
    const close = `</${localName}>`
    const innerHTML = this.toInnerHTML(`${indent}  `)

    if (innerHTML === "") {
      return `${indent}${open}${close}`
    } else {
      return `${indent}${open}${innerHTML}\n${indent}${close}`
    }
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
}

export const nodeNS = (
  namespace,
  localName,
  factList = noFacts,
  kidList = noKids
) => {
  for (
    var kids = [], descendantsCount = 0, index = 0;
    kidList.length > index;
    index++
  ) {
    var kid = kidList[index]
    descendantsCount += kid.descendantsCount || 0
    kids.push(kid)
  }
  descendantsCount += kids.length

  return new Node(
    localName,
    organizeFacts(factList),
    kids,
    namespace,
    descendantsCount
  )
}

export var node = nodeNS.bind(null, null)

// KEYED NODE

class KeyedNode {
  constructor(localName, facts, kids, namespace, descendantsCount) {
    this.nodeType = KEYED_NODE
    this.localName = localName
    this.settings = facts
    this.children = kids
    this.namespace = namespace
    this.descendantsCount = descendantsCount
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  serializeSettings(key = "") {
    return Node.prototype.serializeSettings.call(this, key)
  }
  toOuterHTML(indent = "", key = "") {
    return Node.prototype.toOuterHTML.call(this, indent, key)
  }
  toInnerHTML(indent = "") {
    let html = ""
    const { children } = this
    if (children.length > 0) {
      for (const [key, child] of children) {
        html += `\n${child.toOuterHTML(indent, key)}`
      }
    }
    return html
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

export const keyedNodeNS = (namespace, localName, factList, kidList) => {
  for (
    var kids = [], descendantsCount = 0, index = 0;
    kidList.length > index;
    index++
  ) {
    var kid = kidList[index]
    descendantsCount += kid[1].descendantsCount || 0
    kids.push(kid)
  }
  descendantsCount += kids.length

  return new KeyedNode(
    localName,
    organizeFacts(factList),
    kids,
    namespace,
    descendantsCount
  )
}

export var keyedNode = keyedNodeNS.bind(null, null)

// CUSTOM

class CustomNode {
  constructor(facts, model, render, diff) {
    this.nodeType = CUSTOM_NODE
    this.settings = facts
    this.model = model
    this.render = render
    this.diff = diff
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  serializeSettings(key = "") {
    return Node.prototype.serializeSettings.call(this, key)
  }
  toOuterHTML(indent = "", key = "") {
    const settings = key === "" ? ` key=${key}` : ""
    return `${indent}<custom-element${settings}><custom-element>`
  }
  toInnerHTML(indent = "") {
    return ""
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

export const custom = (factList, model, render, diff) =>
  new CustomNode(organizeFacts(factList), model, render, diff)

class Doc {
  constructor(title, body) {
    this.title = title
    this.body = body
  }
  map(tagger) {
    return new Doc(this.title, this.body.map(tagger))
  }
  toOuterHTML(indent = "", key = "") {
    const innerHTML = this.toInnerHTML(`${indent}  `)
    return `${indent}<html>\n${innerHTML}\n${indent}<\html>`
  }
  toInnerHTML(indent = "") {
    const head = `<head><title>${this.title}</title></head>`
    const body = this.body.toOuterHTML(indent)
    if (body === "") {
      return `${indent}${head}`
    } else {
      return `${indent}${head}\n${body}`
    }
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

export const doc = (title, body) => new Doc(title, body)

// MAP

class TaggerNode {
  constructor(tagger, node) {
    this.nodeType = TAGGED_NODE
    this.tagger = tagger
    this.node = node
    this.descendantsCount = 1 + (node.descendantsCount || 0)
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  toOuterHTML(indent = "", key = "") {
    return this.node.toOuterHTML(indent, key)
  }
  toInnerHTML(indent = "") {
    return this.node.toInnerHTML(indent)
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

export const map = (tagger, node) => new TaggerNode(tagger, node)

// LAZY

class Thunk {
  constructor(refs, thunk) {
    this.nodeType = THUNK_NODE
    this.refs = refs
    this.force = thunk
    this.node = undefined
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
  toNode() {
    const { node } = this
    if (node) {
      return node
    } else {
      const node = this.force()
      this.node = node
      return node
    }
  }
  toOuterHTML(indent = "", key = "") {
    return this.toNode().toOuterHTML(indent, key)
  }
  toInnerHTML(indent = "") {
    const node = (vNode.node = vNode.force())
    return this.toNode().toInnerHTML(indent)
  }
  get outerHTML() {
    return this.toOuterHTML()
  }
  get innerHTML() {
    return this.toInnerHTML()
  }
}

const thunk = (refs, thunk) => new Thunk(refs, thunk)

export var lazy = function(func, a) {
  return thunk([func, a], function() {
    return func(a)
  })
}

export var lazy2 = function(func, a, b) {
  return thunk([func, a, b], function() {
    return func(a, b)
  })
}

export var lazy3 = function(func, a, b, c) {
  return thunk([func, a, b, c], function() {
    return func(a, b, c)
  })
}

export var lazy4 = function(func, a, b, c, d) {
  return thunk([func, a, b, c, d], function() {
    return func(a, b, c, d)
  })
}

export var lazy5 = function(func, a, b, c, d, e) {
  return thunk([func, a, b, c, d, e], function() {
    return func(a, b, c, d, e)
  })
}

export var lazy6 = function(func, a, b, c, d, e, f) {
  return thunk([func, a, b, c, d, e, f], function() {
    return func(a, b, c, d, e, f)
  })
}

export var lazy7 = function(func, a, b, c, d, e, f, g) {
  return thunk([func, a, b, c, d, e, f, g], function() {
    return func(a, b, c, d, e, f, g)
  })
}

export var lazy8 = function(func, a, b, c, d, e, f, g, h) {
  return thunk([func, a, b, c, d, e, f, g, h], function() {
    return func(a, b, c, d, e, f, g, h)
  })
}

// FACTS

const notaggers = Object.freeze([])
export const on = function(key, handler) {
  return new EventHandler(key, handler, Normal, notaggers)
}

class VirtualDOMStyle {
  constructor(key, value) {
    this.nodeType = SETTING_STYLE
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export var style = function(key, value) {
  return new VirtualDOMStyle(key, value)
}

class VirtualDOMProperty {
  constructor(key, value) {
    this.nodeType = SETTING_PROPERTY
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export var property = function(key, value) {
  return new VirtualDOMProperty(key, value)
}

class VirtualDOMAttribute {
  constructor(key, value) {
    this.nodeType = SETTING_ATTRIBUTE
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export const attribute = (key, value) => new VirtualDOMAttribute(key, value)

class VirtualDOMAttributeNS {
  constructor(namespace, key, value) {
    this.nodeType = SETTING_ATTRIBUTE_NS
    this.key = key
    this.value = { namespace: namespace, value: value }
  }
  map(tag) {
    return this
  }
}

export const attributeNS = (namespace, key, value) =>
  new VirtualDOMAttributeNS(namespace, key, value)

// XSS ATTACK VECTOR CHECKS

export function noScript(localName) {
  return localName == "script" ? "p" : localName
}

export function noOnOrFormAction(key) {
  return /^(on|formAction$)/i.test(key) ? "data-" + key : key
}

export function noInnerHtmlOrFormAction(key) {
  return key == "innerHTML" || key == "formAction" ? "data-" + key : key
}

export function noJavaScriptUri__PROD(value) {
  return /^javascript:/i.test(value.replace(/\s/g, "")) ? "" : value
}

export function noJavaScriptUri__DEBUG(value) {
  return /^javascript:/i.test(value.replace(/\s/g, ""))
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value
}

export function noJavaScriptOrHtmlUri__PROD(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value) ? "" : value
}

export function noJavaScriptOrHtmlUri__DEBUG(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value)
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value
}

// MAP FACTS

class EventHandler {
  constructor(type, decoder, eventPhase, taggers) {
    this.nodeType = SETTING_EVENT
    this.type = type
    this.decoder = decoder
    this.eventPhase = eventPhase
    this.taggers = taggers
  }
  map(tag) {
    const { type, decoder, eventPhase, taggers } = this
    return new EventHandler(type, decoder, eventPhase, [tag, ...taggers])
  }
  forwardEvent(event, eventTarget) {
    const { eventPhase, taggers } = this
    const result = this.decoder.decode(event)

    if (result instanceof Error) {
      return
    }

    const tag = this.eventPhase

    // 0 = Normal
    // 1 = MayStopPropagation
    // 2 = MayPreventDefault
    // 3 = Custom

    const { stopPropagation, preventDefault } = result
    if (stopPropagation) {
      event.stopPropagation()
    }

    if (preventDefault) {
      event.preventDefault()
    }

    let message = result.message
    for (let tag of this.taggers) {
      message = tag(message)
    }

    let currentTarget = eventTarget
    while (currentTarget.tagger) {
      const { tagger } = currentTarget
      if (typeof tagger == "function") {
        message = tagger(message)
      } else {
        for (let i = tagger.length; i--; ) {
          message = tagger[i](message)
        }
      }

      currentTarget = currentTarget.parent
    }

    if (stopPropagation) {
      currentTarget.sync(message) // stopPropagation implies isSync
    } else {
      currentTarget.send(message)
    }
  }
  equal(other) {
    return (
      this.type === other.type &&
      this.eventPhase === other.eventPhase &&
      this.decoder === other.decoder &&
      pairwiseRefEqual(this.taggers, other.taggers)
    )
  }
}

// ORGANIZE FACTS

function organizeFacts(factList) {
  for (
    var facts = {}, index = 0;
    factList.length > index;
    index++ // WHILE_CONS
  ) {
    var fact = factList[index]

    var nodeType = fact.nodeType

    switch (nodeType) {
      case SETTING_PROPERTY: {
        const { key, value } = fact
        if (key === "className") {
          addClass(facts, key, value)
        } else {
          facts[key] = value
        }
        break
      }
      case SETTING_STYLE: {
        const { key, value } = fact
        var subFacts = facts[nodeType] || (facts[nodeType] = {})
        subFacts[key] = value
        break
      }
      case SETTING_EVENT: {
        const { type, handler } = fact
        var subFacts = facts[nodeType] || (facts[nodeType] = {})
        subFacts[type] = fact
        break
      }
      case SETTING_ATTRIBUTE: {
        const { key, value } = fact
        var subFacts = facts[nodeType] || (facts[nodeType] = {})
        if (key === "class") {
          addClass(subFacts, key, value)
        } else {
          subFacts[key] = value
        }
        break
      }
      case SETTING_ATTRIBUTE_NS: {
        const { key, value } = fact
        var subFacts = facts[nodeType] || (facts[nodeType] = {})
        if (key === "class") {
          addClass(subFacts, key, value)
        } else {
          subFacts[key] = value
        }
        break
      }
    }
  }

  return facts
}

function addClass(object, key, newClass) {
  var classes = object[key]
  object[key] = classes ? classes + " " + newClass : newClass
}

// RENDER

function render(doc, vNode, eventNode) {
  var nodeType = vNode.nodeType

  if (nodeType === THUNK_NODE) {
    return render(doc, vNode.node || (vNode.node = vNode.force()), eventNode)
  }

  if (nodeType === TEXT) {
    return doc.createTextNode(vNode.text)
  }

  if (nodeType === TAGGED_NODE) {
    var subNode = vNode.node
    var tagger = vNode.tagger

    while (subNode.nodeType === TAGGED_NODE) {
      typeof tagger !== "object"
        ? (tagger = [tagger, subNode.tagger])
        : tagger.push(subNode.tagger)

      subNode = subNode.node
    }

    var subEventRoot = { tagger: tagger, parent: eventNode }
    var domNode = render(doc, subNode, subEventRoot)
    domNode.elm_event_node_ref = subEventRoot
    return domNode
  }

  if (nodeType === CUSTOM_NODE) {
    var domNode = vNode.render(doc, vNode.model)
    applyFacts(domNode, eventNode, vNode.settings)
    return domNode
  }

  if (nodeType === CUSTOM_ELEMENT) {
    const { elementConstructor, localName, options } = vNode
    const { customElements } = document.defaultView
    const registration = customElements.get(localName)
    if (registration) {
      if (registration !== elementConstructor.registration) {
        Object.setPrototypeOf(
          registration.prototype,
          elementConstructor.prototype
        )
        elementConstructor.registration = registration
        registration.proto = elementConstructor.prototype
      }
    } else {
      const registration = class extends vNode.elementConstructor {
        constructor(...args) {
          super(...args)
        }
        connectedCallback(...args) {
          if (registration.proto.connectedCallback) {
            super.connectedCallback(...args)
          }
        }
        disconnectedCallback(...args) {
          if (registration.proto.disconnectedCallback) {
            super.disconnectedCallback(...args)
          }
        }
        adoptedCallback(...args) {
          if (registration.proto.adoptedCallback) {
            super.adoptedCallback(...args)
          }
        }
        attributeChangedCallback(...args) {
          if (registration.proto.attributeChangedCallback) {
            super.attributeChangedCallback(...args)
          }
        }
      }
      registration.proto = vNode.elementConstructor.prototype
      elementConstructor.registration = registration
      customElements.define(localName, registration, options)
    }
  }

  // at this point `nodeType` must be NODE or KEYED_NODE

  var domNode = vNode.namespace
    ? doc.createElementNS(vNode.namespace, vNode.localName)
    : doc.createElement(vNode.localName)

  const { onnavigate } = doc.defaultView
  if (onnavigate && vNode.localName == "a") {
    domNode.addEventListener("click", onnavigate)
  }

  applyFacts(domNode, eventNode, vNode.settings)

  for (var kids = vNode.children, i = 0; i < kids.length; i++) {
    appendChild(
      domNode,
      render(doc, nodeType === NODE ? kids[i] : kids[i][1], eventNode)
    )
  }

  return domNode
}

// APPLY FACTS

function applyFacts(domNode, eventNode, facts) {
  for (var key in facts) {
    var value = facts[key]

    switch (key) {
      case SETTING_STYLE: {
        applyStyles(domNode, value)
        break
      }
      case SETTING_EVENT: {
        applyEvents(domNode, eventNode, value)
        break
      }
      case SETTING_ATTRIBUTE: {
        applyAttrs(domNode, value)
        break
      }
      case SETTING_ATTRIBUTE_NS: {
        applyAttrsNS(domNode, value)
        break
      }
      default: {
        switch (key) {
          case "value": {
            if (domNode.value !== value) {
              domNode.value = value
            }
            break
          }
          case "checked":
            break
          case domNode[key]:
            break
          default: {
            domNode[key] = value
            break
          }
        }
      }
    }
  }
}

// APPLY STYLES

function applyStyles(domNode, styles) {
  var domNodeStyle = domNode.style

  for (var key in styles) {
    domNodeStyle[key] = styles[key]
  }
}

// APPLY ATTRS

function applyAttrs(domNode, attrs) {
  for (var key in attrs) {
    var value = attrs[key]
    value != null
      ? domNode.setAttribute(key, value)
      : domNode.removeAttribute(key)
  }
}

// APPLY NAMESPACED ATTRS

function applyAttrsNS(domNode, nsAttrs) {
  for (var key in nsAttrs) {
    var pair = nsAttrs[key]
    var namespace = pair.namespace
    var value = pair.value

    value
      ? domNode.setAttributeNS(namespace, key, value)
      : domNode.removeAttributeNS(namespace, key)
  }
}

// APPLY EVENTS

class EventRouter {
  constructor() {
    this.handlers = {}
    this.handleEvent = this.handleEvent.bind(this)
    this.target = null
  }
  handleEvent(event) {
    this.handlers[event.type].forwardEvent(event, this.target)
  }
}

function applyEvents(domNode, eventNode, events) {
  const router =
    domNode.eventRouter || (domNode.eventRouter = new EventRouter())
  router.target = eventNode
  const { handlers, handleEvent } = router

  for (var key in events) {
    const oldHandler = handlers[key]
    const newHandler = events[key]

    if (!newHandler) {
      domNode.removeEventListener(key, handleEvent)
      handlers[key] = null
      continue
    }

    if (oldHandler) {
      if (oldHandler.type === newHandler.type) {
        handlers[key] = newHandler
        continue
      } else {
        domNode.removeEventListener(key, handleEvent)
      }
    }

    const { eventPhase } = newHandler
    handlers[key] = newHandler
    const passive = eventPhase == Normal || eventPhase == MayStopPropagation
    domNode.addEventListener(key, handleEvent, passiveSupported && { passive })
  }
}

// PASSIVE EVENTS

var passiveSupported

try {
  window.addEventListener(
    "t",
    null,
    Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true
      }
    })
  )
} catch (e) {}

// EVENT HANDLERS

const Normal = 0
const MayStopPropagation = 1
const MayPreventDefault = 2
const Custom = 3

// DIFF

// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
export function diff(x, y) {
  var patches = []
  diffHelp(x, y, patches, 0)
  return patches
}

function pushPatch(patches, op, index, data) {
  var patch = {
    op: op,
    index: index,
    changes: data,
    domNode: undefined,
    eventNode: undefined
  }
  patches.push(patch)
  return patch
}

function diffHelp(x, y, patches, index) {
  if (x === y) {
    return
  }

  var xType = x.nodeType
  var yType = y.nodeType

  // Bail if you run into different types of nodes. Implies that the
  // structure has changed significantly and it's not worth a diff.
  if (xType !== yType) {
    if (xType === NODE && yType === KEYED_NODE) {
      y = dekey(y)
      yType = NODE
    } else {
      pushPatch(patches, OP_REDRAW, index, y)
      return
    }
  }

  // Now we know that both nodes are the same type.
  switch (yType) {
    case THUNK_NODE: {
      var xRefs = x.refs
      var yRefs = y.refs
      var i = xRefs.length
      var same = i === yRefs.length
      while (same && i--) {
        same = xRefs[i] === yRefs[i]
      }
      if (same) {
        y.node = x.node
        return
      }
      y.node = y.force()
      var subPatches = []
      diffHelp(x.node, y.node, subPatches, 0)
      subPatches.length > 0 && pushPatch(patches, OP_THUNK, index, subPatches)
      return
    }
    case TAGGED_NODE: {
      // gather nested taggers
      var xTaggers = x.tagger
      var yTaggers = y.tagger
      var nesting = false

      var xSubNode = x.node
      while (xSubNode.nodeType === TAGGED_NODE) {
        nesting = true

        typeof xTaggers !== "object"
          ? (xTaggers = [xTaggers, xSubNode.tagger])
          : xTaggers.push(xSubNode.tagger)

        xSubNode = xSubNode.node
      }

      var ySubNode = y.node
      while (ySubNode.nodeType === TAGGED_NODE) {
        nesting = true

        typeof yTaggers !== "object"
          ? (yTaggers = [yTaggers, ySubNode.tagger])
          : yTaggers.push(ySubNode.tagger)

        ySubNode = ySubNode.node
      }

      // Just bail if different numbers of taggers. This implies the
      // structure of the virtual DOM has changed.
      if (nesting && xTaggers.length !== yTaggers.length) {
        pushPatch(patches, OP_REDRAW, index, y)
        return
      }

      // check if taggers are "the same"
      if (
        nesting ? !pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers
      ) {
        pushPatch(patches, OP_TAGGER, index, yTaggers)
      }

      // diff everything below the taggers
      diffHelp(xSubNode, ySubNode, patches, index + 1)
      return
    }
    case TEXT: {
      if (x.text !== y.text) {
        pushPatch(patches, OP_TEXT, index, y.text)
      }
      return
    }
    case NODE: {
      diffNodes(x, y, patches, index, diffKids)
      return
    }
    case KEYED_NODE: {
      diffNodes(x, y, patches, index, diffKeyedKids)
      return
    }
    case CUSTOM_ELEMENT: {
      if (x.elementConstructor !== y.elementConstructor) {
        pushPatch(patches, OP_REDRAW, index, y)
        return
      } else {
        diffNodes(x, y, patches, index, diffKids)
        return
      }
    }

    case CUSTOM_NODE:
      if (x.render !== y.render) {
        pushPatch(patches, OP_REDRAW, index, y)
        return
      }

      var factsDiff = diffFacts(x.settings, y.settings)
      factsDiff && pushPatch(patches, OP_FACTS, index, factsDiff)

      var patch = y.diff(x.model, y.model)
      patch && pushPatch(patches, OP_CUSTOM, index, patch)

      return
  }
}

// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs) {
  for (var i = 0; i < as.length; i++) {
    if (as[i] !== bs[i]) {
      return false
    }
  }

  return true
}

function diffNodes(x, y, patches, index, diffKids) {
  // Bail if obvious indicators have changed. Implies more serious
  // structural changes such that it's not worth it to diff.
  if (x.localName !== y.localName || x.namespace !== y.namespace) {
    pushPatch(patches, OP_REDRAW, index, y)
    return
  }

  var factsDiff = diffFacts(x.settings, y.settings)
  factsDiff && pushPatch(patches, OP_FACTS, index, factsDiff)

  diffKids(x, y, patches, index)
}

// DIFF FACTS

// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(x, y, category) {
  var diff

  // look for changes and removals
  for (var xKey in x) {
    if (
      xKey === SETTING_STYLE ||
      xKey === SETTING_EVENT ||
      xKey === SETTING_ATTRIBUTE ||
      xKey === SETTING_ATTRIBUTE_NS
    ) {
      var subDiff = diffFacts(x[xKey], y[xKey] || {}, xKey)
      if (subDiff) {
        diff = diff || {}
        diff[xKey] = subDiff
      }
      continue
    }

    // remove if not in the new facts
    if (!(xKey in y)) {
      diff = diff || {}
      diff[xKey] = !category
        ? typeof x[xKey] === "string"
          ? ""
          : null
        : category === SETTING_STYLE
        ? ""
        : category === SETTING_EVENT || category === SETTING_ATTRIBUTE
        ? undefined
        : { namespace: x[xKey].namespace, value: undefined }

      continue
    }

    var xValue = x[xKey]
    var yValue = y[xKey]

    // reference equal, so don't worry about it
    if (
      (xValue === yValue && xKey !== "value" && xKey !== "checked") ||
      (category === SETTING_EVENT && xValue.equal(yValue))
    ) {
      continue
    }

    diff = diff || {}
    diff[xKey] = yValue
  }

  // add new stuff
  for (var yKey in y) {
    if (!(yKey in x)) {
      diff = diff || {}
      diff[yKey] = y[yKey]
    }
  }

  return diff
}

// DIFF KIDS

function diffKids(xParent, yParent, patches, index) {
  var xKids = xParent.children
  var yKids = yParent.children

  var xLen = xKids.length
  var yLen = yKids.length

  // FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

  if (xLen > yLen) {
    pushPatch(patches, OP_REMOVE_LAST, index, {
      offset: yLen,
      diff: xLen - yLen
    })
  } else if (xLen < yLen) {
    pushPatch(patches, OP_APPEND, index, {
      offset: xLen,
      children: yKids
    })
  }

  // PAIRWISE DIFF EVERYTHING ELSE

  for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++) {
    var xKid = xKids[i]
    diffHelp(xKid, yKids[i], patches, ++index)
    index += xKid.descendantsCount || 0
  }
}

// KEYED DIFF

function diffKeyedKids(xParent, yParent, patches, rootIndex) {
  var localPatches = []

  var changes = {} // Dict String Entry
  var inserts = [] // Array { index : Int, entry : Entry }
  // type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

  var xKids = xParent.children
  var yKids = yParent.children
  var xLen = xKids.length
  var yLen = yKids.length
  var xIndex = 0
  var yIndex = 0

  var index = rootIndex

  while (xIndex < xLen && yIndex < yLen) {
    var x = xKids[xIndex]
    var y = yKids[yIndex]

    var [xKey, xNode] = x
    var [yKey, yNode] = y

    // check if keys match

    if (xKey === yKey) {
      index++
      diffHelp(xNode, yNode, localPatches, index)
      index += xNode.descendantsCount || 0

      xIndex++
      yIndex++
      continue
    }

    // look ahead 1 to detect insertions and removals.

    var xNext = xKids[xIndex + 1]
    var yNext = yKids[yIndex + 1]

    if (xNext) {
      var xNextKey = xNext[0]
      var xNextNode = xNext[1]
      var oldMatch = yKey === xNextKey
    }

    if (yNext) {
      var yNextKey = yNext[0]
      var yNextNode = yNext[1]
      var newMatch = xKey === yNextKey
    }

    // swap x and y
    if (newMatch && oldMatch) {
      index++
      diffHelp(xNode, yNextNode, localPatches, index)
      insertNode(changes, localPatches, xKey, yNode, yIndex, inserts)
      index += xNode.descendantsCount || 0

      index++
      removeNode(changes, localPatches, xKey, xNextNode, index)
      index += xNextNode.descendantsCount || 0

      xIndex += 2
      yIndex += 2
      continue
    }

    // insert y
    if (newMatch) {
      index++
      insertNode(changes, localPatches, yKey, yNode, yIndex, inserts)
      diffHelp(xNode, yNextNode, localPatches, index)
      index += xNode.descendantsCount || 0

      xIndex += 1
      yIndex += 2
      continue
    }

    // remove x
    if (oldMatch) {
      index++
      removeNode(changes, localPatches, xKey, xNode, index)
      index += xNode.descendantsCount || 0

      index++
      diffHelp(xNextNode, yNode, localPatches, index)
      index += xNextNode.descendantsCount || 0

      xIndex += 2
      yIndex += 1
      continue
    }

    // remove x, insert y
    if (xNext && xNextKey === yNextKey) {
      index++
      removeNode(changes, localPatches, xKey, xNode, index)
      insertNode(changes, localPatches, yKey, yNode, yIndex, inserts)
      index += xNode.descendantsCount || 0

      index++
      diffHelp(xNextNode, yNextNode, localPatches, index)
      index += xNextNode.descendantsCount || 0

      xIndex += 2
      yIndex += 2
      continue
    }

    break
  }

  // eat up any remaining nodes with removeNode and insertNode

  while (xIndex < xLen) {
    index++
    var x = xKids[xIndex]
    var xNode = x[1]
    removeNode(changes, localPatches, x[0], xNode, index)
    index += xNode.descendantsCount || 0
    xIndex++
  }

  while (yIndex < yLen) {
    var endInserts = endInserts || []
    var y = yKids[yIndex]
    insertNode(changes, localPatches, y[0], y[1], undefined, endInserts)
    yIndex++
  }

  if (localPatches.length > 0 || inserts.length > 0 || endInserts) {
    pushPatch(patches, OP_REORDER, rootIndex, {
      subPatches: localPatches,
      inserts: inserts,
      endInserts: endInserts
    })
  }
}

// CHANGES FROM KEYED DIFF

var POSTFIX = "_elmW6BL"

function insertNode(changes, localPatches, key, vnode, yIndex, inserts) {
  var entry = changes[key]

  // never seen this key before
  if (!entry) {
    entry = {
      op: OP_INSERT,
      vnode: vnode,
      index: yIndex,
      changes: undefined
    }

    inserts.push({ index: yIndex, entry: entry })
    changes[key] = entry

    return
  }

  // this key was removed earlier, a match!
  if (entry.op === OP_DELETE) {
    inserts.push({ index: yIndex, entry: entry })

    entry.op = OP_MOVE
    var subPatches = []
    diffHelp(entry.vnode, vnode, subPatches, entry.index)
    entry.index = yIndex
    entry.changes.changes = {
      subPatches: subPatches,
      entry: entry
    }

    return
  }

  // this key has already been inserted or moved, a duplicate!
  insertNode(changes, localPatches, key + POSTFIX, vnode, yIndex, inserts)
}

function removeNode(changes, localPatches, key, vnode, index) {
  var entry = changes[key]

  // never seen this key before
  if (!entry) {
    var patch = pushPatch(localPatches, OP_REMOVE, index, undefined)

    changes[key] = {
      op: OP_DELETE,
      vnode: vnode,
      index: index,
      changes: patch
    }

    return
  }

  // this key was inserted earlier, a match!
  if (entry.op === OP_INSERT) {
    entry.op = OP_MOVE
    var subPatches = []
    diffHelp(vnode, entry.vnode, subPatches, index)

    pushPatch(localPatches, OP_REMOVE, index, {
      subPatches: subPatches,
      entry: entry
    })

    return
  }

  // this key has already been removed or moved, a duplicate!
  removeNode(changes, localPatches, key + POSTFIX, vnode, index)
}

// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.

function addDomNodes(domNode, vNode, patches, eventNode) {
  addDomNodesHelp(
    domNode,
    vNode,
    patches,
    0,
    0,
    vNode.descendantsCount,
    eventNode
  )
}

// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode) {
  var patch = patches[i]
  var index = patch.index

  while (index === low) {
    var patchType = patch.op

    if (patchType === OP_THUNK) {
      addDomNodes(domNode, vNode.node, patch.changes, eventNode)
    } else if (patchType === OP_REORDER) {
      patch.domNode = domNode
      patch.eventNode = eventNode

      var subPatches = patch.changes.subPatches
      if (subPatches.length > 0) {
        addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode)
      }
    } else if (patchType === OP_REMOVE) {
      patch.domNode = domNode
      patch.eventNode = eventNode

      var data = patch.changes
      if (data) {
        data.entry.changes = domNode
        var subPatches = data.subPatches
        if (subPatches.length > 0) {
          addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode)
        }
      }
    } else {
      patch.domNode = domNode
      patch.eventNode = eventNode
    }

    i++

    if (!(patch = patches[i]) || (index = patch.index) > high) {
      return i
    }
  }

  var nodeType = vNode.nodeType

  if (nodeType === TAGGED_NODE) {
    var subNode = vNode.node

    while (subNode.nodeType === TAGGED_NODE) {
      subNode = subNode.node
    }

    return addDomNodesHelp(
      domNode,
      subNode,
      patches,
      i,
      low + 1,
      high,
      domNode.elm_event_node_ref
    )
  }

  // tag must be NODE or KEYED_NODE at this point

  var vKids = vNode.children
  var childNodes = domNode.childNodes
  for (var j = 0; j < vKids.length; j++) {
    low++
    var vKid = nodeType === NODE ? vKids[j] : vKids[j][1]
    var nextLow = low + (vKid.descendantsCount || 0)
    if (low <= index && index <= nextLow) {
      i = addDomNodesHelp(
        childNodes[j],
        vKid,
        patches,
        i,
        low,
        nextLow,
        eventNode
      )
      if (!(patch = patches[i]) || (index = patch.index) > high) {
        return i
      }
    }
    low = nextLow
  }
  return i
}

// APPLY PATCHES

export const patch = (rootDomNode, oldVirtualNode, patches, eventNode) => {
  if (patches.length === 0) {
    return rootDomNode
  }

  addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode)
  return applyPatchesHelp(rootDomNode, patches)
}

function applyPatchesHelp(rootDomNode, patches) {
  for (var i = 0; i < patches.length; i++) {
    var patch = patches[i]
    var localDomNode = patch.domNode
    var newNode = applyPatch(localDomNode, patch)
    if (localDomNode === rootDomNode) {
      rootDomNode = newNode
    }
  }
  return rootDomNode
}

function applyPatch(domNode, patch) {
  const doc = domNode.ownerDocument
  switch (patch.op) {
    case OP_REDRAW: {
      return applyPatchRedraw(domNode, patch.changes, patch.eventNode)
    }
    case OP_FACTS: {
      applyFacts(domNode, patch.eventNode, patch.changes)
      return domNode
    }
    case OP_TEXT: {
      domNode.replaceData(0, domNode.length, patch.changes)
      return domNode
    }
    case OP_THUNK: {
      return applyPatchesHelp(domNode, patch.changes)
    }
    case OP_TAGGER: {
      if (domNode.elm_event_node_ref) {
        domNode.elm_event_node_ref.tagger = patch.changes
      } else {
        domNode.elm_event_node_ref = {
          tagger: patch.changes,
          parent: patch.eventNode
        }
      }
      return domNode
    }
    case OP_REMOVE_LAST: {
      var data = patch.changes
      for (var i = 0; i < data.diff; i++) {
        domNode.removeChild(domNode.childNodes[data.offset])
      }
      return domNode
    }
    case OP_APPEND: {
      var data = patch.changes
      var kids = data.children
      var i = data.offset
      var theEnd = domNode.childNodes[i]
      for (; i < kids.length; i++) {
        domNode.insertBefore(render(doc, kids[i], patch.eventNode), theEnd)
      }
      return domNode
    }
    case OP_REMOVE: {
      var data = patch.changes
      if (!data) {
        domNode.parentNode.removeChild(domNode)
        return domNode
      }
      var entry = data.entry
      if (typeof entry.index !== "undefined") {
        domNode.parentNode.removeChild(domNode)
      }
      entry.changes = applyPatchesHelp(domNode, data.subPatches)
      return domNode
    }
    case OP_REORDER: {
      return applyPatchReorder(domNode, patch)
    }
    case OP_CUSTOM: {
      return patch.changes(domNode)
    }
    default: {
      throw TypeError("Unknown operation")
    }
  }
}

function applyPatchRedraw(domNode, vNode, eventNode) {
  const doc = domNode.ownerDocument
  var parentNode = domNode.parentNode
  var newNode = render(doc, vNode, eventNode)

  if (!newNode.elm_event_node_ref) {
    newNode.elm_event_node_ref = domNode.elm_event_node_ref
  }

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode)
  }
  return newNode
}

function applyPatchReorder(domNode, patch) {
  const doc = domNode.ownerDocument
  var data = patch.changes

  // remove end inserts
  var frag = applyPatchReorderEndInsertsHelp(doc, data.endInserts, patch)

  // removals
  domNode = applyPatchesHelp(domNode, data.subPatches)

  // inserts
  var inserts = data.inserts
  for (var i = 0; i < inserts.length; i++) {
    var insert = inserts[i]
    var entry = insert.entry
    var node =
      entry.op === OP_MOVE
        ? entry.changes
        : render(doc, entry.vnode, patch.eventNode)
    domNode.insertBefore(node, domNode.childNodes[insert.index])
  }

  // add end inserts
  if (frag) {
    appendChild(domNode, frag)
  }

  return domNode
}

function applyPatchReorderEndInsertsHelp(doc, endInserts, patch) {
  if (!endInserts) {
    return
  }

  var frag = doc.createDocumentFragment()
  for (var i = 0; i < endInserts.length; i++) {
    var insert = endInserts[i]
    var entry = insert.entry
    appendChild(
      frag,
      entry.op === OP_MOVE
        ? entry.changes
        : render(doc, entry.vnode, patch.eventNode)
    )
  }
  return frag
}

export function virtualize(root) {
  // TEXT NODES

  if (root.nodeType === 3) {
    return text(root.textContent)
  }

  // WEIRD NODES

  if (root.nodeType !== 1) {
    return text("")
  }

  // ELEMENT NODES

  var factList = []
  var attrs = root.attributes
  for (var i = attrs.length; i--; ) {
    var attr = attrs[i]
    var name = attr.name
    var value = attr.value

    switch (name) {
      case "style":
        break
      default:
        factList.push(attribute(name, value))
    }
  }

  const rules = root.style
  for (var i = rules.length; i--; ) {
    var name = rules[i]
    var value = rules[name]
    factList.push(style(name, value))
  }

  var localName = root.localName
  var kidList = []
  var kids = root.childNodes

  for (var i = kids.length; i--; ) {
    kidList.unshift(virtualize(kids[i]))
  }
  return node(localName, factList, kidList)
}

function dekey(keyedNode) {
  var keyedKids = keyedNode.children
  var len = keyedKids.length
  var kids = new Array(len)
  for (var i = 0; i < len; i++) {
    kids[i] = keyedKids[i][1]
  }

  return {
    nodeType: NODE,
    localName: keyedNode.localName,
    settings: keyedNode.settings,
    children: kids,
    namespace: keyedNode.namespace,
    descendantsCount: keyedNode.descendantsCount
  }
}
