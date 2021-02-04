import { ILogger } from "logger-flx";
import * as fs from "fs";
import * as path from "path";
import { Module } from "./lib/module";
import { IHandlers, IModule, IHandlersConfig, IHandlerJobConfig, IHandlersJob, IJobJson } from "./interfaces";
import * as chalk from "chalk";
import Ajv from "ajv";
import jtomler from "jtomler";
import json_from_schema from "json-from-default-schema";
import * as job_config_schema from "./lib/job_schema.json";
import { HandlersJob } from "./lib/job";
import { INotifications } from "../notifications";
import { IMetricsStore } from "../metrics-store";
import { ITemporaryStore } from "../temporary-store";
import { HandlersDynamicJob } from "./lib/dynamic-job";

export * from "./interfaces";

const getFilesList = (folder: string, regexp: string = ".*", files_list: string[]  = []) => {

    const files = fs.readdirSync(folder);
    const reg = new RegExp(regexp, "i");

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile() === true) {
            if (reg.test(file_path) === true) {
                files_list.push(full_file_path);
            }
        } else {
            getFilesList(full_file_path, regexp, files_list);
        }

    }

    return files_list;

};

export class Handlers implements IHandlers {

    private readonly _jobs_list: {
        [key: string]: IHandlersJob | HandlersDynamicJob
    }

    constructor (
        private readonly _config: IHandlersConfig,
        private readonly _notifications: INotifications,
        private readonly _metrics_store: IMetricsStore,
        private readonly _temporary_store: ITemporaryStore,
        private readonly _logger: ILogger
    ) {
        this._jobs_list = {};
    }

    get json (): IJobJson[] {

        let result: IJobJson[] = [];

        for (const job_name in this._jobs_list) {
            const job = this._jobs_list[job_name];
            result = result.concat(job.json);
        }

        return result;

    }

    async run (): Promise<void> {

        const full_handlers_path = path.resolve(process.cwd(), this._config.modules_path);
        const full_settings_path = path.resolve(process.cwd(), this._config.settings_path);

        const modules_list: {
            [key: string]: IModule
        } = {};

        if (fs.existsSync(full_handlers_path) === false) {
            fs.mkdirSync(full_handlers_path, {
                recursive: true
            });
            this._logger.log(`[Handlers] Folder ${chalk.gray(full_handlers_path)} created`, "dev");
        }

        const handlers_files = getFilesList(full_handlers_path, "\.js$");

        for (const file_path of handlers_files) {

            const id = file_path.replace(full_handlers_path, "").replace(/(^\/|^\\)/,"").replace(/\.js$/,"");
            const func = await import(file_path);       
            const module = new Module(id, func, this._logger);

            modules_list[id] = module;

        }

        if (fs.existsSync(full_settings_path) === false) {
            fs.mkdirSync(full_settings_path, {
                recursive: true
            });
            this._logger.log(`[Handlers] Folder ${chalk.gray(full_settings_path)} created`, "dev");
        }

        const settings_files = getFilesList(full_settings_path, "(\.toml|\.yml|\.json)$");

        for (const file_path of settings_files) {

            const job_config: IHandlerJobConfig = <IHandlerJobConfig>json_from_schema(jtomler(file_path), job_config_schema);
            const ajv = new Ajv({
                strict: false
            });
            const validate = ajv.compile(job_config_schema);
            
            if (!validate(job_config)) {
                this._logger.error(`[Handlers] Error parsing job config ${chalk.gray(file_path)} Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
                process.exit(1);
            }

            //const query_config: IQueryConfig = job_config.query;
            const id = file_path.replace(full_settings_path, "").replace(/(^\/|^\\)/,"").replace(/(\.toml|\.yml|\.json)$/,"");
            
            if (modules_list[job_config.handler] === undefined) {
                this._logger.error(`[Handlers] Module ${chalk.gray(job_config.handler)} for job ${chalk.gray(id)} not found`);
                process.exit(1);
            }

            for (const notification_name of job_config.notifications) {
                if (this._notifications.exist(notification_name) === false) {
                    this._logger.error(`[Handlers] Notification channel ${chalk.gray(notification_name)} for job ${chalk.gray(id)} not found`);
                    process.exit(1);
                }
            }
    
            const module = modules_list[job_config.handler];

            if (job_config.global === true) {
                this._jobs_list[id] = new HandlersJob(id, job_config, module, this._notifications, this._metrics_store, this._temporary_store, this._logger);
            }

            if (job_config.global === false) {
                this._jobs_list[id] = new HandlersDynamicJob(id, job_config, module, this._notifications, this._metrics_store, this._temporary_store, this._logger);
            }

        }

        for (const job_name in this._jobs_list) {
            const job = this._jobs_list[job_name];
            job.run();
        }

    }

    async stop (): Promise<void> {
        return;
    }

}