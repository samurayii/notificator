import { Catalog } from "di-ts-decorators";
import { Context, Controller, Get } from "koa-ts-decorators";
import { ILogger, Logger } from "logger-flx";
import * as chalk from "chalk";
import { IMetricsStore, MetricsStore } from "../../../lib/metrics-store";

@Controller("/v1/metrics", "api-server")
export class ApiMetrics {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _metrics_store: IMetricsStore = <IMetricsStore>Catalog(MetricsStore)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }  

    @Get("/:db/:table/:record", "api-server")
    async metrics_record (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const table_name = ctx.params.table;
        const record_name = ctx.params.record;
        const db = this._metrics_store.db(db_name);
        const table = db?.table(table_name);
        const record = table?.query(record_name);

        if (db === undefined || table === undefined || record === undefined) {
            ctx.body = { 
                status: "fail",
                message: `record "${record_name}" of table "${table_name}" for database "${db_name}" not found`
            };
        } else {

            ctx.body = { 
                status: "success",
                data: {
                    db: db_name,
                    table: table_name,
                    record: record_name,
                    data: record.json
                }
            };
        }

        ctx.status = 200;
    
    }

    @Get("/:db/:table", "api-server")
    async metrics_table (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const table_name = ctx.params.table;
        const db = this._metrics_store.db(db_name);
        const table = db?.table(table_name);

        if (db === undefined || table === undefined) {
            ctx.body = { 
                status: "fail",
                message: `table "${table_name}" for database "${db_name}" not found`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: {
                    db: db_name,
                    table: table_name,
                    records: table.records
                }
            };
        }

        ctx.status = 200;
    
    }

    @Get("/:db", "api-server")
    async metrics_db (ctx: Context): Promise<void> {

        const db_name = ctx.params.db;
        const db = this._metrics_store.db(db_name);

        if (db === undefined) {
            ctx.body = { 
                status: "fail",
                message: `database "${db_name}" not found`
            };
        } else {
            ctx.body = { 
                status: "success",
                data: {
                    db: db_name,
                    tables: db.tables
                }
            };
        }

        ctx.status = 200;
    
    }

    @Get("/", "api-server")
    async index (ctx: Context): Promise<void> {

        const result = this._metrics_store.dbs;

        ctx.body = { 
            status: "success",
            data: result
        };
        
        ctx.status = 200;
    
    }

}