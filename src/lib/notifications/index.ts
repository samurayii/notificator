import { ILogger } from "logger-flx";
import { 
    IChannel, 
    IChannelJson, 
    IEmailChannelConfig, 
    INotifications, 
    INotificationsConfig, 
    ITelegramChannelConfig
} from "./interfaces";
import { EmailChannel } from "./lib/email-channel";
import { TelegramChannel } from "./lib/telegram-channel";

export * from "./interfaces";

export class Notifications implements INotifications {

    private readonly _channels_list: {
        [key: string]: IChannel
    }

    constructor (
        private readonly _config: INotificationsConfig,
        private readonly _logger: ILogger
    ) {

        this._channels_list = {};

        for (const item of this._config.channels) {

            if (this._channels_list[item.name] !== undefined) {
                throw new Error(`[Notifications] Output named "${item.name}" already exist`);
            }

            switch(item.type) { 
                case "telegram": { 
                    this._channels_list[item.name] = new TelegramChannel(<ITelegramChannelConfig>item, this._logger);
                    break;
                }
                case "email": { 
                    this._channels_list[item.name] = new EmailChannel(<IEmailChannelConfig>item, this._logger);
                    break;
                }
                default: { 
                    throw new Error(`[Notifications] Output type ${item.type} not support`);
                } 
            }

        }

    }

    get json (): IChannelJson[] {
        const result: IChannelJson[] = [];
        for (const channel_name in this._channels_list) {
            const channel = this._channels_list[channel_name];
            result.push({
                enable: channel.enable,
                type: channel.type,
                name: channel.name
            });
        }
        return result;
    }

    exist (channel_name: string): boolean {
        if (this._channels_list[channel_name] === undefined) {
            return false;
        }
        return true;
    }

    push (channel_name: string, data: unknown): void {
        if (this._channels_list[channel_name] === undefined) {
            return;
        }
        const channel = this._channels_list[channel_name];
        channel.push(data);
    }

}