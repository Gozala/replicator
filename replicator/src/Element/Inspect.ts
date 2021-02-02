export interface Inspection<T> {
  send(value: T): void
  render(): Element
}

export interface Inspector<T> {
  spawn(value: T, document: Document): Inspection<T>
}

export type Inspectors<T> = Record<string, Inspector<T>>

export type Projeciton<T> = HTMLElement & { source: T }
export interface Projector<T> {
  iterate(source: AsyncIterator<T>): Projeciton<T>
  inspect(value: T): Projeciton<T>
  html(): Projeciton<T>
  svg(): Projeciton<T>
  md(): Projeciton<T>
}

export interface Projections<T> {
  [key: string]: (value: T, projector: Projector<T>) => Projeciton<T>
}
