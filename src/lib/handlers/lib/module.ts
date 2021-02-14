import { ILogger } from "logger-flx";
import { IModule, IQueryRecord } from "../interfaces";
import * as chalk from "chalk";
import { HandlersJobCheckContext } from "./check-context";

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
        this._func.call(context, query_record, data);
    }

    check () : void {
        const context = new HandlersJobCheckContext();

        this._logger.log(`[Handlers] Module ${chalk.gray(this._id)} checking ...`, "dev");

        this._func.call(context, {}, {});

        this._logger.log(`[Handlers] Module ${chalk.gray(this._id)} check complete`, "dev");
    }

}