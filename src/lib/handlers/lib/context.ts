import * as clone from "clone";
import { ITemporaryStore } from "../../temporary-store";
import { IMetricsStore } from "../../metrics-store";
import { IHandlersJob, IHandlersSubJob } from "../interfaces";

export class HandlersJobContext {

    status: string
    module: string
    job: string
    global: boolean
    check: boolean
    success: () => void;
    description: (description: string) => void;
    warning: (data?: unknown) => void;
    nodata: (data?: unknown) => void;
    alert: (data?: unknown) => void;
    metrics: {
        query: (db_name: string, table_name: string, record_name: string) => unknown
        queryRegExp: (db_name: string, table_name: string, regexp: string) => unknown
        queryRegExpAll: (db_name: string, table_name: string, regexp: string) => unknown[]
    }
    db: {
        keys: () => string[]
        request: (record_name:string, store_name?: string) => unknown
        exist: (record_name:string, store_name?: string) => boolean
        remove: (record_name:string) => void
        update: (record_name:string, data: unknown) => void
    }

    constructor (
        job: IHandlersJob | IHandlersSubJob,
        metrics_store: IMetricsStore,
        temporary_store: ITemporaryStore
    ) {

        this.status = job.status;
        this.job = job.id;
        this.module = job.module;
        this.global = job.global;
        this.check = false;

        const store = temporary_store.get(job.id);

        this.success = (data: unknown = "") => {
            job.success(data);
        };

        this.nodata = (data: unknown = "") => {
            job.nodata(data);
        };

        this.warning = (data: unknown = "") => {
            job.warning(data);
        };

        this.alert = (data: unknown = "") => {
            job.alert(data);
        };

        this.description = (description: string) => {
            if (typeof description !== "string") {
                throw new Error(`Transmitted description to modules ${this.module} not type string`);
            }
            job.description = description;
        };

        this.metrics = {
            query: (db_name: string, table_name: string, record_name: string) => {
                const result = metrics_store.query(db_name, table_name, record_name);
                if (result === undefined) {
                    return;
                }
                return clone(result.json);
            },
            queryRegExp:  (db_name: string, table_name: string, regexp: string) => {   
                const result = metrics_store.queryRegExp(db_name, table_name, regexp);
                if (result === undefined) {
                    return;
                }
                return clone(result.json);
            },
            queryRegExpAll: (db_name: string, table_name: string, regexp: string) => {
                const record_list = metrics_store.queryRegExpAll(db_name, table_name, regexp);
                if (record_list === undefined) {
                    return;
                }
                const result = [];
                for (const record of record_list) {
                    result.push(clone(record.json));
                }
                return result;
            }
        };

        this.db = {
            keys: () => {
                return store.keys;
            },
            request: (record_name:string, store_name?: string) => {
                return store.request(record_name, store_name);
            },
            exist: (record_name:string, store_name?: string) => {
                return store.exist(record_name, store_name);
            },
            remove: (record_name:string) => {
                return store.remove(record_name);
            },
            update: (record_name:string, data: unknown) => {
                return store.update(record_name, data);
            }
        };

    }

}