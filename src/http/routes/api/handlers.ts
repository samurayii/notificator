import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import * as chalk from "chalk";
import { ILogger, Logger } from "logger-flx";
import { Handlers, IHandlers } from "../../../lib/handlers";

@Controller("/v1/handlers", "api-server")
export class ApiHandlers {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _handlers: IHandlers = <IHandlers>Catalog(Handlers)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    @Get("/", "api-server")
    async list (ctx: Context): Promise<void> {
        
        const result = this._handlers.json;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

}