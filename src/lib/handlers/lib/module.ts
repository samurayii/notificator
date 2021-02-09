import { ILogger } from "logger-flx";
import { IModule, IQueryRecord } from "../interfaces";
import * as chalk from "chalk";

export class Module implements IModule {

    constructor (
        private readonly _id: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        private readonly _func: Function,
        private readonly _logger: ILogger
    ) {
        this._logger.log(`[Handlers] Module ${chalk.gray(this._id)} created`, "dev");
    }

    get id (): string {
        return this._id;
    }

    exec (context: unknown, query_record?: IQueryRecord, data?: unknown): void {
        
        try {
            this._func.call(context, query_record, data);
        } catch (error) {
            this._logger.error(`[Handlers] Error exec for ${chalk.gray(this._id)} module. ${error.message}`);
            this._logger.log(error.stack, "debug");
        }
        
    }

}