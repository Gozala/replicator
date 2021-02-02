import { Port } from "./Task"
export interface Doc<T> {
  title: string;
  body: Node<T>;

  map<U>(f:(inn:T) => U): Doc<U>;
}

declare export class Node<T> {
  settings(): Attribute<T>[];
  children(): Node<T>[];
  map<U>(f:(inn:T) => U): Node<U>;
}
declare export class Attribute<T> {
  map<U>(f:(inn:T) => U): Attribute<U>;
}
export type KeyedNode<T> = [string, Node<T>]

declare export function node<T>(
  localName: string,
  attributes?: Attribute<T>[],
  children?: Node<T>[]
): Node<T>

declare export function customElement<T>(
  localName: string,
  constructor: {new():HTMLElement},
  attributes?: Attribute<T>[]
): Node<T>

declare export function keyedNode<T>(
  localName: string,
  attributes?: Attribute<T>[],
  children?: KeyedNode<T>[]
): Node<T>

declare export function keyedNodeNS<T>(
  namespace: string,
  localName: string,
  attributes?: Attribute<T>[],
  children?: KeyedNode<T>[]
): Node<T>

declare export function nodeNS<T>(
  namespace: string,
  localName: string,
  attributes?: Attribute<T>[],
  children?: Node<T>[]
): Node<T>

declare export function text(value: string): Node<never>
declare export function doc<T>(title: string, body: Node<T>): Doc<T>

declare export function property<T>(name: string, value: T): Attribute<never>
declare export function attribute(
  name: string,
  value: null | string
): Attribute<never>

declare export function attributeNS(
  namespace: string,
  name: string,
  value: string | boolean | number | null | void
): Attribute<never>
declare export function style(string, string): Attribute<never>

export interface Decoder<In, Out> {
  decode(inn): Out | Error;
}

export type EncodedEvent =
  | Event
  | DragEvent
  | MouseEvent
  | KeyboardEvent
  | UIEvent

// Note: Doing optional fields fails Decoder.flow.
// Doing more fancy unions prevents flow from proper inference.
export type DecodedEvent<T> =
  | { message: T }
  | { preventDefault: boolean }
  | { stopPropagation: boolean }
  | { message: T, preventDefault: boolean }
  | { message: T, stopPropagation: boolean }
  | { message: T, preventDefault: boolean, stopPropagation: boolean }

export interface EventDecoder<T> extends Decoder<EncodedEvent, DecodedEvent<T>> {

}

declare export function on<T>(type:string, decoder:EventDecoder<T>): Attribute<T>

declare class Delta {}

export type { Delta }

declare export function diff<T>(before:Node<T>, after:Node<T>): Delta
declare export function patch<T>(
  root: EventTarget,
  current: Node<T>,
  delta: Delta,
  port: Port<T>
): void
declare export function virtualize<T>(EventTarget): Node<T>
