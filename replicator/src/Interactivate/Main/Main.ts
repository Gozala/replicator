import type * as Reflex from "../../../modules/reflex/src/lib"
import type * as Notebook from "../Notebook/Notebook"

export { Notebook }
export interface Model {
  notebook: MaybeSaved<Notebook.Model>
  saveRequest: SaveRequest
}

export interface MaybeSaved<Doc> {
  before: Doc
  after: Doc
}

export type SaveRequest =
  | { tag: "NotSaving" }
  | { tag: "Saving" }
  | { tag: "SavingFailed"; value: Error }

export type Route =
  | { tag: "navigate"; value: URL }
  | { tag: "load"; value: URL }
  | { tag: "navigated"; value: URL }

export type Message =
  | { tag: "route"; value: Route }
  | { tag: "notebook"; value: Notebook.Message }
  | { tag: "save"; value: true }
  | { tag: "published"; value: URL }
  | { tag: "saved"; value: true }
  | { tag: "saveError"; value: Error }
export type Effect = Reflex.Effect.Effect<Message>
export type State = [Model, Effect]

export type View = Reflex.DOM.Doc<Message>
