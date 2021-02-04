
import { convertTime } from "./convert-time";
import { CronJob } from "cron";
import { ILogger } from "logger-flx";
import { 
    IHandlerJobConfig, 
    IHandlersSubJob, 
    IJobJson, 
    IModule,
    IQuery
} from "../interfaces";
import { INotifications } from "../../notifications";
import { IMetricsStore } from "../../metrics-store";
import { ITemporaryStore } from "../../temporary-store";
import { Query } from "./query";
import * as chalk from "chalk";
import { HandlersSubJob } from "./sub-job";

export class HandlersDynamicJob {

    private readonly _query: IQuery
    private readonly _job_list: {
        [key: string]: IHandlersSubJob
    }
    private _last_update: number
    private readonly _update: number
    private readonly _ttl: number
    private _job: CronJob
    private _starting_flag: boolean

    constructor (
        private readonly _id: string,
        private readonly _config: IHandlerJobConfig,
        private readonly _module: IModule,
        private readonly _notifications: INotifications,
        private readonly _metrics_store: IMetricsStore,
        private readonly _temporary_store: ITemporaryStore,
        private readonly _logger: ILogger
    ) {
        
        this._job_list = {};
        this._last_update = Date.now();
        this._update = convertTime(this._config.update);
        this._ttl = convertTime(this._config.ttl);
        this._query = new Query(this._id, this._config.query, this._metrics_store, this._logger);
        this._starting_flag = false;

        this._job = new CronJob(this._config.cron.interval, () => {
            this._updateJobs();
        },
        null,
        false,
        this._config.cron.time_zone);

        this._logger.log(`[Handlers] Dynamic job ${chalk.gray(this._id)} created`, "dev");
    }
    
    get global (): boolean {
        return false;
    }

    get enable (): boolean {
        return this._config.enable;
    }

    _updateJobs (): void {

        const now = Date.now();
        const diff = now - this._last_update;

        if (diff <= this._update) {
            return;
        }

        this._logger.log(`[Handlers] Job ${chalk.gray(this._id)} update`, "dev");

        this._last_update = now;

        const query_list = this._query.json;

        for (const query_record of query_list) {

            const db = query_record.db;
            const table = query_record.table;
            const record = query_record.record;
            const id_sub_job = `${db}_${table}_${record}`;

            if (this._job_list[id_sub_job] !== undefined) {
                continue;
            }

            const job = new HandlersSubJob(id_sub_job, this._config, this._module, this._notifications, this._metrics_store, this._temporary_store, query_record, this._logger);

            job.run();

            this._job_list[id_sub_job] = job;

        }

        for (const job_name in this._job_list) {

            const job = this._job_list[job_name];
            const diff = now - job.last_update;

            if (diff > this._ttl) {
                job.stop();
                delete this._job_list[job_name];
            }
            
        }

    }

    get json (): IJobJson[] {

        let result: IJobJson[] = [];

        for (const job_name in this._job_list) {
            const job = this._job_list[job_name];
            result = result.concat(job.json);
        }

        return result;

    }

    async run (): Promise<void> {

        if (this._starting_flag === true || this._config.enable === false) {
            return;
        }

        this._starting_flag = true;

        this._job.start();

        for (const job_name in this._job_list) {
            const job = this._job_list[job_name];
            job.run();
        }

    }

    async stop (): Promise<void> {

       if (this._starting_flag === false || this._config.enable === false) {
            return;
        }
        
        this._starting_flag = false;

        this._job.stop();

        for (const job_name in this._job_list) {
            const job = this._job_list[job_name];
            job.stop();
        }

    }

}








