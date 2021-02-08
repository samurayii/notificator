import { 
    IMetricsStore, 
    IMetricsStoreConfig, 
    IMetricsStoreDB,
    IMetricsStoreTableRecord, 
    IMetricsStoreTableRecordConfig 
} from "./interfaces";
import { CronJob } from "cron";
import { MetricsStoreDB } from "./lib/db";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";

export * from "./interfaces";

export class MetricsStore implements IMetricsStore {

    private _dbs_list: {
        [keys: string]: IMetricsStoreDB
    }

    private readonly _job: CronJob
    private _starting_flag: boolean

    constructor (
        private readonly _config: IMetricsStoreConfig,
        private readonly _logger: ILogger
    ) {
        
        this._dbs_list = {};
        this._starting_flag = false;

        this._job = new CronJob(this._config.cleaning.interval, () => {
            this.clear();
        },
        null,
        false,
        this._config.cleaning.time_zone);

    }

    get count (): number {
        return Object.keys(this._dbs_list).length;
    }

    get dbs (): string[] {
        return Object.keys(this._dbs_list);
    }

    db (db_name: string): IMetricsStoreDB {
        return this._dbs_list[db_name];
    }

    _escaping (str: string): string {
        return str.replace(/\\/ig, "_");
    }

    query (db_name: string, table_name: string, record_name: string): IMetricsStoreTableRecord {

        db_name = this._escaping(db_name);
        table_name = this._escaping(table_name);
        record_name = this._escaping(record_name);

        if (this._dbs_list[db_name] === undefined) {
            return;
        }

        return this._dbs_list[db_name].query(table_name, record_name);

    }

    queryRegExp (db_name: string, table_name: string, regexp: string): IMetricsStoreTableRecord {

        db_name = this._escaping(db_name);
        table_name = this._escaping(table_name);

        if (this._dbs_list[db_name] === undefined) {
            return;
        }

        return this._dbs_list[db_name].queryRegExp(table_name, regexp);

    }

    queryRegExpAll (db_name: string, table_name: string, regexp: string): IMetricsStoreTableRecord[] {

        db_name = this._escaping(db_name);
        table_name = this._escaping(table_name);

        if (this._dbs_list[db_name] === undefined) {
            return [];
        }

        return this._dbs_list[db_name].queryRegExpAll(table_name, regexp);

    }

    update (db_name: string, table_name: string, record_name: string, data: IMetricsStoreTableRecordConfig): void {

        db_name = this._escaping(db_name);
        table_name = this._escaping(table_name);
        record_name = this._escaping(record_name);

        if (this._dbs_list[db_name] === undefined) {
            this._dbs_list[db_name] = new MetricsStoreDB(db_name, this._config.ttl, this._logger);
            this._logger.log(`[MetricsStore] Created db ${chalk.gray(db_name)}`, "dev");
        }

        this._dbs_list[db_name].update(table_name, record_name, data);
    }

    remove (db_name: string, table_name?: string, record_name?: string): void {

        db_name = this._escaping(db_name);

        if (table_name !== undefined) {
            table_name = this._escaping(table_name);
        }

        if (record_name !== undefined) {
            record_name = this._escaping(record_name);
        }

        if (this._dbs_list[db_name] === undefined) {
            return;
        }

        if (table_name === undefined) {
            this._logger.log(`[MetricsStore] Remove db ${chalk.gray(db_name)}`, "dev");
            delete this._dbs_list[db_name];
            return;
        }

        const db = this._dbs_list[db_name];

        db.remove(table_name, record_name);

        if (db.count <= 0) {
            this.remove(db.name);
        }

    }

    exist (db_name: string, table_name?: string, record_name?: string): boolean {

        db_name = this._escaping(db_name);

        if (table_name !== undefined) {
            table_name = this._escaping(table_name);
        }

        if (record_name !== undefined) {
            record_name = this._escaping(record_name);
        }

        if (this._dbs_list[db_name] === undefined) {
            return false;
        }

        if (table_name === undefined) {
            return true;
        }

        return this._dbs_list[db_name].exist(table_name, record_name);

    }

    clear (db_name?: string, table_name?: string): void {

        if (db_name !== undefined) {
            db_name = this._escaping(db_name);
        }

        if (table_name !== undefined) {
            table_name = this._escaping(table_name);
        }

        if (db_name === undefined) {

            this._logger.log("[MetricsStore] Cleaning all dbs", "dev");

            for (const key in this._dbs_list) {

                const db = this._dbs_list[key];

                db.clear();

                if (db.count <= 0) {
                    this.remove(db.name);
                }

            }

        } else {

            if (this._dbs_list[db_name] === undefined) {
                return;
            }

            const db = this._dbs_list[db_name];

            db.clear(table_name);

            if (db.count <= 0) {
                this.remove(db.name);
            }

        }

    }

    run (): void {
        if (this._config.cleaning.enable === true && this._starting_flag === false) {
            this._starting_flag = true;
            this._job.start();
            this._logger.log(`[MetricsStore] Started. TTL: ${chalk.gray(this._config.ttl)} sec`, "dev");
        }
    }

    stop (): void {
        if (this._config.cleaning.enable === true && this._starting_flag === true) {
            this._starting_flag = false;
            this._job.stop();
            this._logger.log("[MetricsStore] Stopped.", "dev");
        }
    }

}