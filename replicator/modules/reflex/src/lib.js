import * as DOM from "./VirtualDOM.js"
import * as Element from "./Element.js"
import * as Attribute from "./Attribute.js"

import * as Widget from "./Widget.js"
import * as Document from "./Document.js"
import * as Application from "./Application.js"

import * as Effect from "./Effect.js"
import { identity, unreachable, always, nothing } from "./Basics.js"

export {
  // DOM
  DOM,
  Element,
  Attribute,
  // Spawnining VirtualDOM
  Widget,
  Document,
  Application,
  // Effect System
  Effect,
  // Utilities
  identity,
  unreachable,
  always,
  nothing
}
