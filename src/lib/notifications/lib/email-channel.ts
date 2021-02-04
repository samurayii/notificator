
import * as fs from "fs";
import * as path from "path";
import { createTransport, TransportOptions} from "nodemailer";
import { getBody } from "./lib/getBody";
import { IChannel, IEmailChannelConfig } from "../interfaces";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";

interface TEmailOptions {
    from: string
    to: string
    subject: string
    cc?: string
    bcc?: string 
    text?: string
    html?: string
}

interface TTransportOptions extends TransportOptions {
    host: string
    port: number
    secure: boolean
    ignoreTLS: boolean
    auth?: {
        type: string
        user: string
        password: string
        clientId?: string
        clientSecret?: string
        refreshToken?: string
        accessToken?: string
        expires?: number
        accessUrl?: string
        serviceClient?: string
        privateKey?: string
    }
}

export class EmailChannel implements IChannel {

    private readonly _template: string

    constructor (
        private readonly _config: IEmailChannelConfig,
        private readonly _logger: ILogger
    ) {

        if (this._config.template === undefined) {
            this._config.template = path.resolve(__dirname, "../templates/default_email.hbs");
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

        const email_options: TEmailOptions = {
            from: this._config.from,
            to: this._config.to,
            subject: this._config.subject,
            cc: this._config.cc,
            bcc: this._config.bcc
        };

        const transport_options: TTransportOptions = {
            host: this._config.host,
            port: this._config.port,
            secure: this._config.secure,
            ignoreTLS: this._config.ignore_tls
        };

        if (this._config.auth !== undefined) {
            transport_options.auth = {
                type: this._config.auth.type,
                user: this._config.auth.username,
                password: this._config.auth.password,
                clientId: this._config.auth.client_id,
                clientSecret: this._config.auth.client_secret,
                refreshToken: this._config.auth.refresh_token,
                accessToken: this._config.auth.access_token,
                expires: this._config.auth.expires,
                accessUrl: this._config.auth.access_url,
                serviceClient: this._config.auth.service_client,
                privateKey: this._config.auth.private_key,
            };
        }

        if (this._config.parse_mode.toLocaleLowerCase() === "html") {
            email_options.html = body;
        } else {
            email_options.text = body;
        }

        const transporter = createTransport(transport_options);

        const _push = async () => {

            try {

                await transporter.verify();
                await transporter.sendMail(email_options);

                this._logger.log(`[Notifications] Output ${chalk.gray(this._config.name)}, message sended to email ${chalk.cyan(this._config.to)}`, "dev");

                if (this._config.cc !== undefined) {
                    this._logger.log(`[Notifications] Output ${chalk.gray(this._config.name)}, message sended to cc email ${chalk.cyan(this._config.cc)}`, "dev");
                }

                if (this._config.bcc !== undefined) {
                    this._logger.log(`[Notifications] Output ${chalk.gray(this._config.name)}, message sended to bcc email ${chalk.cyan(this._config.bcc)}`, "dev");
                }

            } catch (error) {

                attempt = attempt + 1;
                    
                if (attempt > this._config.attempts) {
                    this._logger.error(`[Notifications] Output ${chalk.gray(this._config.name)}, cannot execute request. Error: ${error}. Attempts exhausted`);
                } else {
                    this._logger.warn(`[Notifications] Output ${chalk.gray(this._config.name)}, cannot execute request. Error: ${error}. ${chalk.green(this._config.attempts - attempt + 1)} attempts left. Repeat after ${chalk.green(this._config.attempt_interval)} sec.`);
                    setTimeout( () => {
                        _push();
                    }, this._config.attempt_interval * 1000);
                }
            }

        };

        _push();

    }

    

}