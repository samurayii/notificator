import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import Ajv from "ajv";
import * as data_schema from "./data_schema.json";
import { ILogger } from "logger-flx";
import { IStore, IStoreData, ITemporaryStore } from "../interfaces";

export class Store implements IStore{

    private _keys: string[]
    private _count: number
    private _current_data: IStoreData

    constructor (
        private readonly _id: string,
        private readonly _file_path: string,
        private readonly _ttl: number,
        private readonly _temporary_store: ITemporaryStore,
        private readonly _logger: ILogger
    ) {

        this._current_data = {
            timestamp: Date.now(),
            data: {}
        };

        let error_flag = false;

        if (fs.existsSync(this._file_path) === true) {

            try {

                const file_data: IStoreData = JSON.parse(fs.readFileSync(this._file_path).toString());

                const ajv = new Ajv({
                    strict: false
                });

                const validate = ajv.compile(data_schema);
            
                if (!validate(file_data)) {
                    this._logger.error(`[TemporaryStore] Data file ${chalk.gray(this._file_path)} parsing error. Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
                    error_flag = true;
                } else {

                    const diff = Date.now() - file_data.timestamp;

                    if (diff > this._ttl * 1000) {
                        error_flag = true;



                        
                    } else {
                        this._current_data = file_data;
                    }

                }

            } catch (error) {
                this._logger.error(`[TemporaryStore] Data file ${chalk.gray(this._file_path)} reading error. ${error.message}`);
                this._logger.log(error.stack, "debug");
                error_flag = true;
            }

        }

        if (error_flag === true) {
            this._logger.warn(`[TemporaryStore] Recreate data file ${this._file_path}`);
            fs.writeFileSync(this._file_path, JSON.stringify(this._current_data, null, 4));
        }

        const dirname = path.dirname(this._file_path);

        if (fs.existsSync(dirname) === false) {
            fs.mkdirSync(dirname, {
                recursive: true
            });
            this._logger.log(`[TemporaryStore] Folder ${dirname} created`, "dev");
        }

        this._keys = Object.keys(this._current_data.data);
        this._count = Object.keys(this._current_data.data).length;

    }
    
    get id (): string {
        return this._id;
    }
    
    get keys (): string[] {
        return this._keys;
    }

    get count (): number {
        return this._count;
    }

    exist (record_name: string, store_name: string): boolean {

        if (store_name !== undefined) {

            if (this._temporary_store.exist(store_name) === false) {
                return false;
            }

            const store = this._temporary_store.get(store_name);

            return store.exist(record_name);

        }

        if (this._current_data.data[record_name] === undefined) {
            return false;
        }

        return true;

    }

    request (record_name: string, store_name: string): unknown {

        if (store_name !== undefined) {

            if (this._temporary_store.exist(store_name) === false) {
                return;
            }

            const store = this._temporary_store.get(store_name);

            return store.request(record_name);

        }

        if (this._current_data.data[record_name] === undefined) {
            return;
        }

        return this._current_data.data[record_name];

    }

    remove (record_name: string): void {
        if (this._current_data.data[record_name] === undefined) {
            return;
        }
        delete this._current_data.data[record_name];
        this._current_data.timestamp = Date.now();
        this._keys = Object.keys(this._current_data.data);
        this._count = Object.keys(this._current_data.data).length;
        fs.writeFileSync(this._file_path, JSON.stringify(this._current_data, null, 4));
        this._logger.log(`[TemporaryStore] Remove record ${chalk.gray(record_name)} from ${chalk.gray(this.id)} store`, "dev");
    }

    update (record_name: string, data: unknown): void {
        this._current_data.data[record_name] = data;
        this._current_data.timestamp = Date.now();
        this._keys = Object.keys(this._current_data.data);
        this._count = Object.keys(this._current_data.data).length;
        fs.writeFileSync(this._file_path, JSON.stringify(this._current_data, null, 4));
        this._logger.log(`[TemporaryStore] Update record ${chalk.gray(record_name)} from ${chalk.gray(this.id)} store`, "dev");
    }

    clear (): void {
        this._current_data.data = {};
        this._current_data.timestamp = Date.now();
        this._keys = Object.keys(this._current_data.data);
        this._count = Object.keys(this._current_data.data).length;
        fs.writeFileSync(this._file_path, JSON.stringify(this._current_data, null, 4));
        this._logger.log(`[TemporaryStore] Cleaned ${chalk.gray(this.id)} store`, "dev");
    }

}