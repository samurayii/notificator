
import { CronJob } from "cron";
import * as chalk from "chalk";
import { ILogger } from "logger-flx";
import { 
    IHandlerJobConfig, 
    IHandlersJob, 
    IJobJson, 
    IModule
} from "../interfaces";
import { INotifications } from "../../notifications";
import { convertTime } from "./convert-time";
import { HandlersJobContext } from "./context";
import { IMetricsStore } from "../../metrics-store";
import { ITemporaryStore } from "../../temporary-store";

type TSendData = {
    id: string
    handler: string
    timestamp: number
    repeat: boolean
    type: string
    data: unknown
};

export class HandlersJob implements IHandlersJob {

    private _last_trigger: number
    private readonly _trigger_interval: number
    private readonly _notification_repeat_interval: number
    private _checked_status: string
    private _job: CronJob
    private _starting_flag: boolean
    private _executing_flag: boolean
    private _status: string

    constructor (
        private readonly _id: string,
        private readonly _config: IHandlerJobConfig,
        private readonly _module: IModule,
        private readonly _notifications: INotifications,
        private readonly _metrics_store: IMetricsStore,
        private readonly _temporary_store: ITemporaryStore,
        private readonly _logger: ILogger
    ) {

        this._starting_flag = false;
        this._executing_flag = false;
        this._trigger_interval = convertTime(this._config.trigger_interval);
        this._notification_repeat_interval = convertTime(this._config.notification_repeat_interval);
        this._last_trigger = Date.now();
        this._status = "success";
        this._checked_status = "success";

        this._job = new CronJob(this._config.cron.interval, () => {
            this.exec();
        },
        null,
        false,
        this._config.cron.time_zone);

        this._logger.log(`[Handlers] Job ${chalk.gray(this._id)} created`, "dev");

    }

    get id (): string {
        return this._id;
    }

    get description (): string {
        return this._config.description;
    }

    get status (): string {
        return this._status;
    }
    set status (status: string) {
        this._status = status;
    }

    get staring (): boolean {
        return this._starting_flag;
    } 
    
    get executing (): boolean {
        return this._executing_flag;
    }
    
    get global (): boolean {
        return true;
    }

    get enable (): boolean {
        return this._config.enable;
    }

    get json (): IJobJson[] {
        return [{
            id: this._id,
            enable: this._config.enable,
            status: this._status,
            global: this.global,
            staring: this._starting_flag,
            executing: this._executing_flag,
            description: this._config.description,
            time_zone: this._config.cron.time_zone,
            cron_interval: this._config.cron.interval
        }];
    }
    
    exec(): void {

        if (this._executing_flag === true || this._config.enable === false) {
            return;
        }

        this._executing_flag = true;

        const context = new HandlersJobContext(this, this._metrics_store, this._temporary_store);

        this._module.exec(context);

        this._executing_flag = false;

    }

    _notification (send_data: TSendData): void {

        if (typeof send_data.data !== "object" || Array.isArray(send_data.data)) {
            if (Array.isArray(send_data.data)) {
                send_data.data = JSON.stringify(send_data.data);
            } else {
                send_data.data = `${send_data.data}`;
            }
        }

        for (const notification_name of this._config.notifications) {
            this._notifications.push(notification_name, send_data);
        }
    }

    alert (data: unknown): void {

        const now = Date.now();
        const send_data: TSendData = {
            id: this._id,
            handler: this._config.handler,
            type: "alert",
            repeat: false,
            timestamp: now,
            data: data
        };

        if (this._status === "alert") {

            const diff = now - this._last_trigger;

            if (diff >= this._notification_repeat_interval) {
                this._last_trigger = now;
                send_data.repeat = true;
                this._notification(send_data);
            }

        } else {

            if (this._checked_status !== "alert") {
                this._checked_status = "alert";
                this._last_trigger = now;
            }

            const diff = now - this._last_trigger;

            if (diff >= this._trigger_interval) {
                this._status = "alert";
                this._last_trigger = now;
                this._notification(send_data);
            }

        }

    }

    success (data: unknown): void {

        const now = Date.now();
        const send_data: TSendData = {
            id: this._id,
            handler: this._config.handler,
            type: "success",
            repeat: false,
            timestamp: now,
            data: data
        };

        if (this._status !== "success") {

            if (this._checked_status !== "success") {
                this._checked_status = "success";
                this._last_trigger = now;
            }

            const diff = now - this._last_trigger;

            if (diff >= this._trigger_interval) {
                this._status = "success";
                this._last_trigger = now;
                this._notification(send_data);
            }

        }
        
    }

    warning (data: unknown): void {

        const now = Date.now();
        const send_data: TSendData = {
            id: this._id,
            handler: this._config.handler,
            type: "warning",
            repeat: false,
            timestamp: now,
            data: data
        };

        if (this._status === "warning") {

            const diff = now - this._last_trigger;

            if (diff >= this._notification_repeat_interval) {
                this._last_trigger = now;
                send_data.repeat = true;
                this._notification(send_data);
            }

        } else {

            if (this._checked_status !== "warning") {
                this._checked_status = "warning";
                this._last_trigger = now;
            }

            const diff = now - this._last_trigger;

            if (diff >= this._trigger_interval) {
                this._status = "warning";
                this._last_trigger = now;
                this._notification(send_data);
            }

        }

    }

    nodata (data: unknown): void {

        const now = Date.now();
        const send_data: TSendData = {
            id: this._id,
            handler: this._config.handler,
            type: "nodata",
            repeat: false,
            timestamp: now,
            data: data
        };

        if (this._status === "nodata") {

            const diff = now - this._last_trigger;

            if (diff >= this._notification_repeat_interval) {
                this._last_trigger = now;
                send_data.repeat = true;
                this._notification(send_data);
            }

        } else {

            if (this._checked_status !== "nodata") {
                this._checked_status = "nodata";
                this._last_trigger = now;
            }

            const diff = now - this._last_trigger;

            if (diff >= this._trigger_interval) {
                this._status = "nodata";
                this._last_trigger = now;
                this._notification(send_data);
            }

        }

    }

    async run (): Promise<void> {
        if (this._starting_flag === true || this._config.enable === false) {
            return;
        }
        this._starting_flag = true;
        this._job.start();
        this._logger.log(`[Handlers] Job ${chalk.gray(this._id)} running`, "dev");
    }

    async stop (): Promise<void> {
        if (this._starting_flag === false) {
            return;
        }
        this._starting_flag = false;
        this._job.stop();
        this._logger.log(`[Handlers] Job ${chalk.gray(this._id)} stopped`, "dev");
    }

}








