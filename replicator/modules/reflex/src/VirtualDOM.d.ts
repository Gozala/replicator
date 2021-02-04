import { Port } from "./Task"
export interface Doc<T> {
  title: string
  body: Node<T>

  map<U>(f: (inn: T) => U): Doc<U>
}

export declare class Node<T> {
  settings(): Attribute<T>[]
  children(): Node<T>[]
  map<U>(f: (inn: T) => U): Node<U>
}
export declare class Attribute<T> {
  map<U>(f: (inn: T) => U): Attribute<U>
}
export type Keyed<T> = [string, T]

export declare function node<
  A extends Attribute<unknown>,
  C extends Node<unknown>
>(localName: string, attributes?: A[], children?: C[]): EventNode<A | C>

type EventSource<T> = Attribute<T> | Node<T>

type EventNode<E extends EventSource<unknown>> = E extends EventSource<infer T>
  ? Node<T>
  : never
export declare function customElement<A extends Attribute<unknown>>(
  localName: string,
  constructor: { new (): HTMLElement },
  attributes?: A[]
): EventNode<A>

export declare function keyedNode<
  A extends Attribute<unknown>,
  C extends Node<unknown>
>(localName: string, attributes?: A[], children?: Keyed<C>[]): EventNode<A | C>

export declare function keyedNodeNS<
  A extends Attribute<unknown>,
  C extends Node<unknown>
>(
  namespace: string,
  localName: string,
  attributes?: A[],
  children?: Keyed<C>[]
): EventNode<A | C>

export declare function nodeNS<
  A extends Attribute<unknown>,
  C extends Node<unknown>
>(
  namespace: string,
  localName: string,
  attributes?: A[],
  children?: C[]
): EventNode<A | C>

export declare function text(value: string): Node<never>
export declare function doc<T>(title: string, body: Node<T>): Doc<T>

export declare function property<T>(name: string, value: T): Attribute<never>
export declare function attribute(
  name: string,
  value: null | string
): Attribute<never>

export declare function attributeNS(
  namespace: string,
  name: string,
  value: string | boolean | number | null | void
): Attribute<never>
export declare function style(string, string): Attribute<never>

export interface Decoder<In, Out> {
  decode(inn): Out | Error
}

export type EncodedEvent =
  | Event
  | DragEvent
  | MouseEvent
  | KeyboardEvent
  | UIEvent

export interface DecodedEvent<T> {
  message: T
  preventDefault?: boolean
  stopPropagation?: boolean
}

export interface EventDecoder<T>
  extends Decoder<EncodedEvent, DecodedEvent<T>> {}

export declare function on<T>(
  type: string,
  decoder: EventDecoder<T>
): Attribute<T>

declare class Delta {}

export type { Delta }

export declare function diff<T>(before: Node<T>, after: Node<T>): Delta
export declare function patch<T>(
  root: EventTarget,
  current: Node<T>,
  delta: Delta,
  port: Port<T>
): void
export declare function virtualize<T>(EventTarget): Node<T>
