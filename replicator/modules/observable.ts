export declare class Inspector<T> {
  constructor(node: HTMLElement)
  rejected(error: Error): void
  fulfilled(value: T): void
}
