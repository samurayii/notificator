/* eslint-disable @typescript-eslint/no-unused-vars */

export class HandlersJobCheckContext {

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

    constructor () {

        this.status = "success";
        this.job = "check-id";
        this.module = "check-module";
        this.global = false;
        this.check = true;

        this.success = (data: unknown = "") => {
            return;
        };

        this.nodata = (data: unknown = "") => {
            return;
        };

        this.warning = (data: unknown = "") => {
            return;
        };

        this.alert = (data: unknown = "") => {
            return;
        };

        this.description = (description: string) => {
            if (typeof description !== "string") {
                throw new Error(`Transmitted description to modules ${this.module} not type string`);
            }
        };

        this.metrics = {
            query: (db_name: string, table_name: string, record_name: string) => {
                return;
            },
            queryRegExp:  (db_name: string, table_name: string, regexp: string) => {   
                return;
            },
            queryRegExpAll: (db_name: string, table_name: string, regexp: string) => {
                return [];
            }
        };

        this.db = {
            keys: () => {
                return [];
            },
            request: (record_name:string, store_name?: string) => {
                return;
            },
            exist: (record_name:string, store_name?: string) => {
                return false;
            },
            remove: (record_name:string) => {
                return;
            },
            update: (record_name:string, data: unknown) => {
                return;
            }
        };

    }

}