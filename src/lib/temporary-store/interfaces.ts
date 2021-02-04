export interface IStoreData {
    timestamp: number
    data: {
        [key: string]: unknown
    }
}

export interface ITemporaryStoreConfig {
    path: string
    ttl: number
}

export interface IStore {
    readonly id: string
    readonly keys: string[]
    readonly count: number
    request: (record_name:string, store_name?: string) => unknown
    exist: (record_name:string, store_name?: string) => boolean
    remove: (record_name:string) => void
    update: (record_name:string, data: unknown) => void
    clear: () => void
}

export interface ITemporaryStore {
    exist: (store_name: string) => boolean
    get: (store_name: string) => IStore
    clear: (store_name: string) => void
}