import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as path from "path";
import * as chalk from "chalk";
import { getBody } from "./lib/getBody";
import { Handlers, IHandlers } from "../../../lib/handlers";

@Controller("/handlers", "web-server")
export class UIHandlers {

    private readonly _template_path: string

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _handlers: IHandlers = <IHandlers>Catalog(Handlers)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
        this._template_path = path.resolve(__dirname, "../../templates/handlers.hbs");
    }  

    @Get("/", "web-server")
    async list (ctx: Context): Promise<void> {

        let page_num = 0;
        let count = 30;

        if (ctx.request.query["page"] !== undefined) {
            page_num = parseInt(ctx.request.query["page"]) - 1;
        }
        if (ctx.request.query["count"] !== undefined) {
            count = parseInt(ctx.request.query["count"]);
        }

        const start = page_num * count;
        const handlers_list = this._handlers.json;

        if (handlers_list.length < start) {
            ctx.body = "Not found";
            ctx.status = 404;
            return;
        }

        const pages_num = Math.ceil(handlers_list.length/count);
        const pages = [];

        const handlebars = handlers_list.slice(start, start + count);
        let i = 0;

        while (i < pages_num) {
            const page = {
                number: (i+1),
                count: count,
                active: false
            };
            if (page_num === i) {
                page.active = true;
            }
            pages.push(page);
            i++;
        }

        ctx.body = await getBody(this._template_path, {
            prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
            pages: pages,
            handlers: handlebars
        });
        ctx.set("Content-Type", "text/html");
        ctx.status = 200;
    
    }

}