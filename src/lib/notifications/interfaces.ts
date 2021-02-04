export interface IChannelConfig {
    enable: boolean
    name: string
    type: string
}

export interface IEmailChannelConfig extends IChannelConfig {
    attempts?: number
    attempt_interval?: number,
    host?: string
    port?: number
    from?: string
    to?: string
    cc?: string
    bcc?: string
    subject?: string
    secure?: boolean
    ignore_tls?: boolean
    parse_mode?: string
    template?: string
    auth?: {
        type?: string
        username?: string
        password?: string
        client_id?: string
        client_secret?: string
        refresh_token?: string
        expires?: number
        access_token?: string
        access_url?: string
        service_client?: string
        private_key?: string
    }
}

export interface ITelegramChannelConfig extends IChannelConfig {
    attempts?: number
    attempt_interval?: number,
    token?: string
    chat_id?: string
    timeout?: number
    parse_mode?: string
    template?: string
    proxy?: {
        protocol: string
        host: string
        port: number
        auth?: {
            username: string
            password: string
        }
    }
}

export interface INotificationsConfig {
    path: string
    channels: Array<ITelegramChannelConfig | IEmailChannelConfig>
}

export interface INotifications {
    readonly json: IChannelJson[]
    exist: (channel_name: string) => boolean
    push: (channel_name: string, data: unknown) => void
}

export interface IChannel {
    readonly name: string
    readonly type: string
    readonly enable: boolean
    push: (data: unknown) => void
}

export interface IChannelJson {
    name: string
    type: string
    enable: boolean
}