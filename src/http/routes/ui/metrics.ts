import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as path from "path";
import * as chalk from "chalk";
import { IMetricsStore, MetricsStore } from "../../../lib/metrics-store";
import { getBody } from "./lib/getBody";

@Controller("/", "web-server")
export class UIMetrics {

    private readonly _template_path: string

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _metrics_store: IMetricsStore = <IMetricsStore>Catalog(MetricsStore)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
        this._template_path = path.resolve(__dirname, "../../templates/index.hbs");
    }  

    @Get("/metrics/:db/:table/(.*)", "web-server")
    async metrics_record (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const table_name = ctx.params.table;
        const record_name = ctx.params[0];
        const db = this._metrics_store.db(db_name);
        const table = db?.table(table_name);
        const record = table?.query(record_name);

        if (db === undefined || table === undefined || record === undefined) {
            ctx.body = "Not Found";
            ctx.status = 404;
        } else {

            ctx.body = await getBody(this._template_path, {
                prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
                db: db_name,
                table: table_name,
                record: record_name,
                data: record.json
            });
            ctx.set("Content-Type", "text/html");
            ctx.status = 200;
        }
    
    }

    @Get("/metrics/:db/:table", "web-server")
    async metrics_table (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const table_name = ctx.params.table;
        const db = this._metrics_store.db(db_name);
        const table = db?.table(table_name);

        if (db === undefined || table === undefined) {
            ctx.body = "Not Found";
            ctx.status = 404;
        } else {
            ctx.body = await getBody(this._template_path, {
                prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
                db: db_name,
                table: table_name,
                data: table.records
            });
            
            ctx.set("Content-Type", "text/html");
            ctx.status = 200;
        }
    
    }

    @Get("/metrics/:db", "web-server")
    async metrics_db (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const db = this._metrics_store.db(db_name);

        if (db === undefined) {
            ctx.body = "Not Found";
            ctx.status = 404;
        } else {
            ctx.body = await getBody(this._template_path, {
                prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
                db: db_name,
                data: db.tables
            });
            ctx.set("Content-Type", "text/html");
            ctx.status = 200;
        }
    
    }

    @Get("/", "web-server")
    @Get("/index.html", "web-server")
    async index (ctx: Context): Promise<void> {
        
        ctx.body = await getBody(this._template_path, {
            prefix: `${ctx.koad.config.prefix.replace(/\/$/gi, "")}`,
            dbs: this._metrics_store.dbs
        });
        ctx.set("Content-Type", "text/html");
        ctx.status = 200;
    
    }

}