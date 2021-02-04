export interface IMetricsStoreTableRecordFields {
    [key: string]: unknown
}

export interface IMetricsStoreTableRecordTags {
    [key: string]: unknown
}

export interface IMetricsStoreTableRecord {
    readonly id: string
    readonly timestamp: number
    readonly fields: IMetricsStoreTableRecordFields
    readonly tags: IMetricsStoreTableRecordTags
    readonly json: IMetricsStoreTableRecordConfig
}

export interface IMetricsStoreTableRecordConfig {
    timestamp: number
    fields: IMetricsStoreTableRecordFields
    tags: IMetricsStoreTableRecordTags
}

export interface IMetricsStoreTable {
    readonly count: number
    readonly name: string
    readonly records: string[]
    exist: (record_name: string) => boolean
    query: (record_name: string) => IMetricsStoreTableRecord
    queryRegExp: (regexp: string) => IMetricsStoreTableRecord
    queryRegExpAll: (regexp: string) => IMetricsStoreTableRecord[]
    remove: (record_name: string) => void
    update: (record_name: string, data: IMetricsStoreTableRecordConfig) => void
    clear: () => void
}

export interface IMetricsStoreDB {
    readonly count: number
    readonly name: string
    readonly tables: string[]
    table: (table_name: string) => IMetricsStoreTable
    query: (table_name: string, record_name: string) => IMetricsStoreTableRecord
    queryRegExp: (table_name: string, regexp: string) => IMetricsStoreTableRecord
    queryRegExpAll: (table_name: string, regexp: string) => IMetricsStoreTableRecord[]
    update: (table_name: string, record_name: string, data: IMetricsStoreTableRecordConfig) => void
    remove: (table_name: string, record_name?: string) => void
    exist: (table_name: string, record_name?: string) => boolean
    clear: (table_name?: string) => void
}

export interface IMetricsStoreConfig {
    ttl: number
    cleaning: {
        enable: boolean
        time_zone: string
        interval: string
    }
}

export interface IMetricsStore {
    readonly count: number
    readonly dbs: string[]
    db: (db_name: string) => IMetricsStoreDB
    query: (db_name: string, table_name: string, record_name: string) => IMetricsStoreTableRecord
    queryRegExp: (db_name: string, table_name: string, regexp: string) => IMetricsStoreTableRecord
    queryRegExpAll: (db_name: string, table_name: string, regexp: string) => IMetricsStoreTableRecord[]
    update: (db_name: string, table_name: string, record_name: string, data: IMetricsStoreTableRecordConfig) => void
    remove: (db_name: string, table_name?: string, record_name?: string) => void
    exist: (db_name: string, table_name?: string, record_name?: string) => boolean
    clear: (db_name?: string, table_name?: string) => void
    run: () => void
    stop: () => void
}