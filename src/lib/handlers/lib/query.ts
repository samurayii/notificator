import { IQuery, IQueryConfig, IQueryRecord } from "../interfaces";
import * as chalk from "chalk";
import { ILogger } from "logger-flx";
import { IMetricsStore } from "../../metrics-store";

export class Query implements IQuery {

    constructor (
        private readonly _id: string,
        private readonly _config: IQueryConfig,
        private readonly _metrics_store: IMetricsStore,
        private readonly _logger: ILogger
    ) {
        this._logger.log(`[Handlers] Query ${chalk.gray(this._id)} created`, "dev");
    }

    get id (): string {
        return this._id;
    }

    get json (): IQueryRecord[] {

        const result: IQueryRecord[] = [];
        const db_list = this._db();

        for (const db_name of db_list) {

            const table_list = this._table(db_name);

            for (const table_name of table_list) {

                const record_list = this._record(db_name, table_name);

                for (const record_name of record_list) {
                    result.push({
                        db: db_name,
                        table: table_name,
                        record: record_name
                    });
                }

            }
            
        }

        return result;

    }

    _db (): string[] {

        const result: string[] = [];

        if (this._config.db.name !== undefined) {
            const db_exist = this._metrics_store.db(this._config.db.name);
            if (db_exist !== undefined) {
                result.push(this._config.db.name);
            }
            return result;
        }

        if (this._config.db.regexp !== undefined) {

            const db_list = this._metrics_store.dbs;
            const regexp = new RegExp(this._config.db.regexp, "i");

            for (const db_name of db_list) {
                if (regexp.test(db_name) === true) {
                    result.push(db_name);
                    return result;
                }
            }

        }

        if (this._config.db.regexp_all !== undefined) {

            const db_list = this._metrics_store.dbs;
            const regexp = new RegExp(this._config.db.regexp_all, "i");

            for (const db_name of db_list) {
                if (regexp.test(db_name) === true) {
                    result.push(db_name);
                }
            }

            return result;

        }

        return result;

    }

    _table (db_name: string): string[] {

        const result: string[] = [];
        const db = this._metrics_store.db(db_name);

        if (db === undefined) {
            return [];
        }

        if (this._config.table.name !== undefined) {
            const table_exist = db.table(this._config.table.name);
            if (table_exist !== undefined) {
                result.push(this._config.table.name);
            }
            return result;
        }

        if (this._config.table.regexp !== undefined) {

            const table_list = db.tables;
            const regexp = new RegExp(this._config.table.regexp, "i");

            for (const table_name of table_list) {
                if (regexp.test(table_name) === true) {
                    result.push(table_name);
                    return result;
                }
            }

        }

        if (this._config.table.regexp_all !== undefined) {

            const table_list = db.tables;
            const regexp = new RegExp(this._config.table.regexp_all, "i");

            for (const table_name of table_list) {
                if (regexp.test(table_name) === true) {
                    result.push(table_name);
                }
            }

            return result;

        }

        return result;

    }

    _record (db_name: string, table_name: string): string[] {

        const result: string[] = [];
        const db = this._metrics_store.db(db_name);

        if (db === undefined) {
            return [];
        }

        const table = db.table(table_name);

        if (table === undefined) {
            return [];
        }

        if (this._config.record.name !== undefined) {
            const record_exist = table.query(this._config.record.name);
            if (record_exist !== undefined) {
                result.push(this._config.record.name);
            }
            return result;
        }

        if (this._config.record.regexp !== undefined) {

            const record_list = table.records;
            const regexp = new RegExp(this._config.record.regexp, "i");

            for (const record_name of record_list) {
                if (regexp.test(record_name) === true) {
                    result.push(record_name);
                    return result;
                }
            }

        }

        if (this._config.record.regexp_all !== undefined) {

            const record_list = table.records;
            const regexp = new RegExp(this._config.record.regexp_all, "i");

            for (const record_name of record_list) {
                if (regexp.test(record_name) === true) {
                    result.push(record_name);
                }
            }

            return result;

        }

        return result;

    }

}