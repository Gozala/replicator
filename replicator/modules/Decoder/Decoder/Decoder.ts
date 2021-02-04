export type Decode<T> = T | Error

export interface Decoder<In, Out> {
  decode(input: In): Error | Out
}

export interface Reader<T> {
  read(input: string): undefined | T
}

export type float = number & { readonly kind: unique symbol }
export type integer = number & { readonly kind: unique symbol }
