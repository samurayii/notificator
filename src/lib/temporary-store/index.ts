import { ILogger } from "logger-flx";
import { IStore, ITemporaryStore, ITemporaryStoreConfig } from "./interfaces";
import * as fs from "fs";
import * as path from "path";
import { Store } from "./lib/store";
import * as chalk from "chalk";

export * from "./interfaces";

const getJsonFilesList = (folder: string, files_list: string[]  = []) => {

    const files = fs.readdirSync(folder);

    files.forEach( (file_path) => {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/\.json$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getJsonFilesList(full_file_path, files_list);
        }

    });

    return files_list;

};

export class TemporaryStore implements ITemporaryStore {
    
    private readonly _store_list: {
        [key: string]: IStore
    }
    private readonly _full_store_path: string

    constructor (
        private readonly _config: ITemporaryStoreConfig,
        private readonly _logger: ILogger
    ) {

        this._store_list = {};

        this._full_store_path = path.resolve(process.cwd(), this._config.path);

        if (fs.existsSync(this._full_store_path) === false) {
            fs.mkdirSync(this._full_store_path, {
                recursive: true
            });
            this._logger.log(`[TemporaryStore] Folder ${this._full_store_path} created`, "dev");
        }

        const files = getJsonFilesList(this._full_store_path);

        for (const file_path of files) {

            const id = file_path.replace(this._full_store_path, "").replace(/\.json/,"").replace(/^\//,"");
            this._store_list[id] = new Store(id, file_path, this._config.ttl, this, this._logger);

            this._logger.log(`[TemporaryStore] Loaded store data from ${chalk.gray(file_path)} with id ${chalk.gray(id)}`, "dev");

        }

    }

    exist (store_name: string): boolean {
        if (this._store_list[store_name] === undefined) {
            return false;
        }
        return true;
    }

    get (store_name: string): IStore {
        if (this._store_list[store_name] === undefined) {
            
            const file_name = `${store_name}.json`;
            const full_store_path = path.resolve(this._full_store_path, file_name);

            this._store_list[store_name] = new Store(store_name, full_store_path, this._config.ttl, this, this._logger);

        }
        return this._store_list[store_name];
    }

    clear (store_name: string): void {

        if (this._store_list[store_name] === undefined) {
            return;
        }

        const store = this._store_list[store_name];

        store.clear();
    }

}