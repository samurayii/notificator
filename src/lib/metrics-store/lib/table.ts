import * as chalk from "chalk";
import { ILogger } from "logger-flx";
import { 
    IMetricsStoreTable, 
    IMetricsStoreTableRecord, 
    IMetricsStoreTableRecordConfig 
} from "../interfaces";
import { MetricsStoreTableRecord } from "./record";

export class MetricsStoreTable implements IMetricsStoreTable {

    private readonly _records_list: {
        [key: string]: IMetricsStoreTableRecord
    }

    constructor (
        private readonly _name: string,
        private readonly _ttl: number,
        private readonly _logger: ILogger
    ) {
        this._records_list = {};
        this._ttl *= 1000;
    }

    get count (): number {
        return Object.keys(this._records_list).length;
    }

    get name (): string {
        return this._name;
    }

    get records (): string[] {
        return Object.keys(this._records_list);
    }

    exist (record_name: string): boolean {
        if (this._records_list[record_name] === undefined) {
            return false;
        }
        return true;
    }

    remove (record_name: string): void {
        if (this._records_list[record_name] === undefined) {
            return;
        }
        delete this._records_list[record_name];
        this._logger.log(`[MetricsStore] Remove record ${chalk.gray(record_name)} from table ${chalk.gray(this._name)}`, "dev");
    }

    update (record_name: string, data: IMetricsStoreTableRecordConfig): void {
        this._records_list[record_name] = new MetricsStoreTableRecord(record_name, data);
        this._logger.log(`[MetricsStore] Update record ${chalk.gray(record_name)} for table ${chalk.gray(this._name)}`, "dev");
    }

    query (record_name: string): IMetricsStoreTableRecord {

        if (this._records_list[record_name] === undefined) {
            return;
        }

        const record = this._records_list[record_name];
        const diff = Date.now() - record.timestamp;

        if (diff > this._ttl) {
            delete this._records_list[record_name];
            return;
        }

        return record;
    }

    queryRegExp (regexp: string): IMetricsStoreTableRecord {

        const reg = new RegExp(regexp, "i");

        for (const record_name in this._records_list) {

            if (reg.test(record_name) === true) {

                const record = this._records_list[record_name];
                const diff = Date.now() - record.timestamp;

                if (diff > this._ttl) {
                    delete this._records_list[record_name];
                    return;
                }

                return record;

            }

        }

    }

    queryRegExpAll (regexp: string): IMetricsStoreTableRecord[] {

        const reg = new RegExp(regexp, "i");
        const result = [];

        for (const record_name in this._records_list) {

            if (reg.test(record_name) === true) {

                const record = this._records_list[record_name];
                const diff = Date.now() - record.timestamp;

                if (diff > this._ttl) {
                    delete this._records_list[record_name];
                }

                result.push(record);

            }

        }

        return result;

    }

    clear (): void {

        this._logger.log(`[MetricsStore] Cleaning table ${this._name}`);

        for (const record_name in this._records_list) {

            const record = this._records_list[record_name];
            const diff = Date.now() - record.timestamp;

            if (diff > this._ttl) {
                delete this._records_list[record_name];
                this._logger.log(`[MetricsStore] Remove record ${chalk.gray(record_name)} from table ${this._name} (outdated)`, "dev");
            }

        }

    }

}