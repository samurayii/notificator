export interface IHandlers {
    readonly json: IJobJson[]
    run: () => Promise<void>
    stop: () => Promise<void>
}

export interface IJobJson {
    id: string
    enable: boolean
    status: string
    global: boolean
    staring: boolean
    executing: boolean
    description: string
    time_zone: string
    cron_interval: string
}

export interface IHandlersJob {
    readonly id: string
    readonly description: string
    readonly module: string
    status: string
    readonly staring: boolean
    readonly executing: boolean
    readonly global: boolean
    readonly json: IJobJson[]
    readonly enable: boolean
    exec: () => void
    run: () => Promise<void>
    stop: () => Promise<void>
    alert: (data: unknown) => void
    success: (data: unknown) => void
    warning: (data: unknown) => void
    nodata: (data: unknown) => void
}

export interface IHandlersSubJob {
    readonly id: string
    readonly description: string
    readonly module: string
    status: string
    readonly staring: boolean
    readonly executing: boolean
    readonly global: boolean
    readonly json: IJobJson[]
    readonly enable: boolean
    readonly last_update: number
    exec: (data: unknown, query_record: IQueryRecord) => void
    run: () => Promise<void>
    stop: () => Promise<void>
    alert: (data: unknown) => void
    success: (data: unknown) => void
    warning: (data: unknown) => void
    nodata: (data: unknown) => void
}

export interface IQueryRecord {
    db: string
    table: string
    record: string
}

export interface IHandlersConfig {
    store_path: string
    modules_path: string
    settings_path: string
}

export interface IModule {
    readonly id: string
    exec: (context: unknown, query_record?: IQueryRecord, data?: unknown) => void
}

export interface IQuery {
    readonly id: string
    readonly json: IQueryRecord[]
}

export interface IHandlerJobConfig {
    global: boolean
    enable: boolean
    description: string
    trigger_interval: string
    notification_repeat_interval: string
    notifications: string[],
    ttl?: string
    update?:string
    cron: {
        time_zone: string
        interval: string
    }
    query?: IQueryConfig
    handler: string
}

export interface IQueryConfig {
    db?: {
        name?: string
        regexp?: string
        regexp_all: string
    }
    table?: {
        name?: string
        regexp?: string
        regexp_all: string
    }
    record?: {
        name?: string
        regexp?: string
        regexp_all: string
    }
}