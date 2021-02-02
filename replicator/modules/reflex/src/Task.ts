export type Phantom<T> = T & { readonly kind: unique symbol }

export type ThreadID = Phantom<string>

export interface Thread {
  exit(reason?: Error): void
}

export interface Port<T> {
  send(message: T): unknown
}

export interface Main<message> extends Port<message> {
  link(thread: Thread): ThreadID
  unlink(thread: Thread): void
  linked(thread: ThreadID): Thread | undefined | null
}

export interface IO<T> {
  perform(thread: Main<T>): unknown
}
export type Transaction<message, state> = [state, IO<message>]

export interface Sync<T> {
  sync(value: T): void
}

export interface Effect<T> extends IO<T> {
  map<U>(tag: (value: T) => U): Effect<U>
}

export interface AsyncResult<X, T> {
  then(succeed: (value: T) => void, fail: (error: X) => void): unknown
}

export interface Task<X, T> {
  (): AsyncResult<X, T>
}
