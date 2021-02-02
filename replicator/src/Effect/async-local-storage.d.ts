declare class StorageArea<a> {
  constructor(name: string): void
  set(string, a): Promise<void>
  get(string): Promise<a | void>
  has(string): Promise<boolean>
  delete(string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  values(): Promise<a[]>
  entries(): Promise<Array<[string, a]>>
  backingStore(): { database: string; store: "store"; version: number }
}

declare var storage: StorageArea<any>

export { storage, StorageArea }
