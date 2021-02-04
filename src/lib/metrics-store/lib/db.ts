import { 
    IMetricsStoreTable, 
    IMetricsStoreTableRecord, 
    IMetricsStoreTableRecordConfig 
} from "../interfaces";
import { MetricsStoreTable } from "./table";
import { IMetricsStoreDB } from "../interfaces";
import { ILogger } from "logger-flx";
import * as chalk from "chalk";

export class MetricsStoreDB implements IMetricsStoreDB {

    private _tables_list: {
        [keys: string]: IMetricsStoreTable
    }

    constructor (
        private readonly _name: string,
        private readonly _ttl: number,
        private readonly _logger: ILogger
    ) {  
        this._tables_list = {};
    }

    get count (): number {
        return Object.keys(this._tables_list).length;
    }

    get tables (): string[] {
        return Object.keys(this._tables_list);
    }

    get name (): string {
        return this._name;
    }

    table (table_name: string): IMetricsStoreTable {
        return this._tables_list[table_name];
    }

    query (table_name: string, record_name: string): IMetricsStoreTableRecord {

        if (this._tables_list[table_name] === undefined) {
            return;
        }

        return this._tables_list[table_name].query(record_name);

    }

    queryRegExp (table_name: string, regexp: string): IMetricsStoreTableRecord {

        if (this._tables_list[table_name] === undefined) {
            return;
        }

        return this._tables_list[table_name].queryRegExp(regexp);

    }

    queryRegExpAll (table_name: string, regexp: string): IMetricsStoreTableRecord[] {

        if (this._tables_list[table_name] === undefined) {
            return [];
        }

        return this._tables_list[table_name].queryRegExpAll(regexp);

    }

    update (table_name: string, record_name: string, data: IMetricsStoreTableRecordConfig): void {

        if (this._tables_list[table_name] === undefined) {
            this._tables_list[table_name] = new MetricsStoreTable(table_name, this._ttl, this._logger);
            this._logger.log(`[MetricsStore] Created table ${chalk.gray(table_name)} for db ${chalk.gray(this._name)}`, "dev");
        }

        this._tables_list[table_name].update(record_name, data);
    }

    remove (table_name: string, record_name?: string): void {

        if (this._tables_list[table_name] === undefined) {
            return;
        }

        if (record_name === undefined) {
            this._logger.log(`[MetricsStore] Remove table ${chalk.gray(table_name)} from db ${chalk.gray(this._name)}`, "dev");
            delete this._tables_list[table_name];
            return;
        }

        const table = this._tables_list[table_name];

        table.remove(record_name);

        if (table.count <= 0) {
            this.remove(table.name);
        }

    }

    exist (table_name: string, record_name?: string): boolean {

        if (this._tables_list[table_name] === undefined) {
            return false;
        }

        if (record_name === undefined) {
            return true;
        }

        return this._tables_list[table_name].exist(record_name);

    }

    clear (table_name?: string): void {

        if (table_name === undefined) {

            this._logger.log(`[MetricsStore] Cleaning all tables for db ${chalk.gray(this._name)}`, "dev");

            for (const key in this._tables_list) {

                const table = this._tables_list[key];

                table.clear();

                if (table.count <= 0) {
                    this.remove(table.name);
                }

            }

        } else {

            if (this._tables_list[table_name] === undefined) {
                return;
            }

            const table = this._tables_list[table_name];

            table.clear();

            if (table.count <= 0) {
                this.remove(table.name);
            }

        }

    }

}