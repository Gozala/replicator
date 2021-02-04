import type { DOM, Effect } from "../../../modules/reflex/src/lib.js"
export type Message =
  | { tag: "change"; value: string }
  | { tag: "leave"; value: Direction }
  | { tag: "remove"; value: Direction }
  | { tag: "split" }
  | { tag: "focus" }
  | { tag: "output"; value: Output }
  | { tag: "insert"; value: { input: string }[] }
  | { tag: "execute" }
  | { tag: "join"; value: Direction }
  | { tag: "print" }

export interface Model {
  id: string
  input: string
  output: Output | undefined
}

export type View = DOM.Node<Message>

export type State = [Model, Effect.Effect<Message>]
export type AnalyzeResult =
  | { ok: { bindings: string[] }; error?: undefined }
  | { ok?: undefined; error: { name: string; message: string } }

export interface Output {}
export interface Input {
  input: string
}

export type Direction = -1 | 1
