import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as path from "path";
import * as chalk from "chalk";
import { getBody } from "./lib/getBody";
import { Notifications, INotifications } from "../../../lib/notifications";

@Controller("/channels", "web-server")
export class UIChannels {

    private readonly _template_path: string

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _notifications: INotifications = <INotifications>Catalog(Notifications)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
        this._template_path = path.resolve(__dirname, "../../templates/channels.hbs");
    }  

    @Get("/", "web-server")
    async list (ctx: Context): Promise<void> {

        ctx.body = await getBody(this._template_path, {
            prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
            channels: this._notifications.json
        });
        ctx.set("Content-Type", "text/html");
        ctx.status = 200;
    
    }

}