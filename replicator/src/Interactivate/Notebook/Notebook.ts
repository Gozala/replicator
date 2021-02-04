import type {
  ID,
  Direction,
  SelectionMap,
} from "../../../modules/Data/SelectionMap.js"
import type * as Cell from "../Cell/Cell.js"
import type * as Reflex from "../../../modules/reflex/src/lib"

export type { ID, Direction, Cell }

export interface Doc {
  url: URL
  content: string
  isOwner: boolean
}

export type Status = "loading" | "ready" | "error"
export type Cells = SelectionMap<Cell.Model>

export interface Model {
  url: URL | null
  isOwner: boolean
  nextID: number
  status: Status
  cells: Cells
}
export type Inbox =
  | { tag: "print" }
  | { tag: "onLoaded"; value: { content: string; url: URL; isOwner: boolean } }
  | { tag: "onLoadError"; value: Error }
  | { tag: "onCell"; value: [ID, Cell.Message] }
  | { tag: "onCellChanged"; value: ID }

export type Message =
  | { tag: "onLoaded"; value: { content: string; url: URL; isOwner: boolean } }
  | { tag: "onLoadError"; value: Error }
  | { tag: "onCell"; value: [ID, Cell.Message] }
  | { tag: "onCellChanged"; value: ID }

export type Effect = Reflex.Effect.Effect<Message>
export type State = [Model, Effect]

export type View = Reflex.DOM.Node<Message>
