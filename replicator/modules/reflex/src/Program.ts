import { Transaction, Main } from "./Task"
import { Node } from "./VirtualDOM"
export interface Program<Message, State, View, Options> {
  init(options: Options): Transaction<Message, State>
  update(message: Message, state: State): Transaction<Message, State>
  view(state: State): View
}

export interface Router<Message> {
  onExternalURLRequest(url: URL): Message
  onInternalURLRequest(url: URL): Message
  onURLChange(url: URL): Message
}
export interface Application<Message, State, View, Options>
  extends Router<Message>,
    Program<Message, State, View, Options> {}

export interface DocumentView<T> {
  title: string
  body: Node<T>
}

export interface RenderedDocument<T> {
  body: Element
  title: string
  location: Location
  widget?: {
    node: DocumentView<T>
    thread: Main<T>
  }
}
