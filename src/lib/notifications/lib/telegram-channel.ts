import { ILogger } from "logger-flx";
import { IChannel, ITelegramChannelConfig } from "../interfaces";
import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Telegraf } from "telegraf";
import { getBody } from "./lib/getBody";
import { Agent } from "https";
import { ParseMode } from "./types/telegraf";

type TProxyOptions = {
    protocol: string
    auth?: string
    host: string
    port: number
    timeout: number
}

export class TelegramChannel implements IChannel {

    private readonly _template: string

    constructor (
        private readonly _config: ITelegramChannelConfig,
        private readonly _logger: ILogger
    ) {

        if (this._config.template === undefined) {
            this._config.template = path.resolve(__dirname, "../templates/default_telegram.hbs");
        }

        const full_template_path = path.resolve(process.cwd(), this._config.template);

        if (fs.existsSync(full_template_path) === false) {
            this._logger.error(`[Notifications] Template file ${chalk.gray(full_template_path)} not found`);
            process.exit(1);
        }

        this._template = full_template_path;

        this._logger.info(`[Notifications] Output ${chalk.gray(this._config.name)} created`, "dev");

    }

    get name (): string {
        return this._config.name;
    }

    get type (): string {
        return this._config.type;
    }

    get enable (): boolean {
        return this._config.enable;
    }

    run (): void {
        return;
    }

    stop (): void {
        return;
    }

    async push (data: unknown, attempt: number = 1): Promise<void> {

        if (this._config.enable === false) {
            return;
        }

        let body: string;

        try {
            body = await getBody(this._template, data);
        } catch (error) {
            this._logger.error(`[Notifications] Output ${chalk.gray(this._config.name)}, error parsing message. ${error}`);
            this._logger.log(error.stack, "debug");
            return;
        }

        let agent;

        if (this._config.proxy !== undefined) {

            const options: TProxyOptions = {
                timeout: this._config.timeout * 1000,
                protocol: this._config.proxy.protocol,
                host: this._config.proxy.host,
                port: this._config.proxy.port
            }; 

            if (this._config.proxy.auth !== undefined) {
                options.auth = `${this._config.proxy.auth.username}:${this._config.proxy.auth.password}`;
            }

            agent = new HttpsProxyAgent(options);

        } else {
            agent = new Agent({
                timeout: this._config.timeout * 1000
            });
        }

        const telegram = new Telegraf(this._config.token, {
            telegram: {
                agent: agent
            }
        }).telegram;

        telegram.webhookReply = false;

        try {

            await telegram.sendMessage(this._config.chat_id, body, {
                parse_mode: <ParseMode>this._config.parse_mode
            });

            this._logger.log(`[Notifications] Output ${chalk.gray(this._config.name)}, message sended to chat ${chalk.gray(this._config.chat_id)}`, "dev");

        } catch (error) {

            const next_attempt: number = attempt + 1;
                
            if (next_attempt > this._config.attempts) {
                this._logger.error(`[Notifications] Output ${chalk.gray(this._config.name)}, cannot execute request. Error: ${error}. Attempts exhausted`);
            } else {
                this._logger.warn(`[Notifications] Output ${chalk.gray(this._config.name)}, cannot execute request. Error: ${error}. ${chalk.green(this._config.attempts - attempt + 1)} attempts left. Repeat after ${chalk.green(this._config.attempt_interval)} sec.`);
                setTimeout( () => {
                    this.push(body, next_attempt);
                }, this._config.attempt_interval * 1000);
            }

        }

    }
    
}