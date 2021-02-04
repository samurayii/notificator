import { Catalog } from "di-ts-decorators";
import { Context, Controller, Post, Next } from "koa-ts-decorators";
import Ajv from "ajv";
import * as chalk from "chalk";
import { ILogger, Logger } from "logger-flx";
import { IMetricsStore, MetricsStore } from "../../../lib/metrics-store";

const telegraf_json_schema = {
    anyOf: [
        {
            type: "object",
            properties: {
                metrics: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            fields: {
                                type: "object"
                            },
                            name: {
                                type: "string",
                                minLength: 1,
                                maxLength: 256
                            },
                            tags: {
                                type: "object"
                            },
                            timestamp: {
                                type: "integer",
                                minimum: 1
                            }
                        },
                        required: [
                            "fields",
                            "name",
                            "tags",
                            "timestamp"
                        ]
                    },
                    minItems: 0
                }
            },
            required: [
                "metrics"
            ]
        },
        {
            type: "array",
            items: {
                type: "object",
                properties: {
                    fields: {
                        type: "object"
                    },
                    name: {
                        type: "string",
                        minLength: 1,
                        maxLength: 256
                    },
                    tags: {
                        type: "object"
                    },
                    timestamp: {
                        type: "integer",
                        minimum: 1
                    }
                },
                required: [
                    "fields",
                    "name",
                    "tags",
                    "timestamp"
                ]
            },
            minItems: 0
        }
    ] 
};

type TTelegraf = {
    fields: {
        [key: string]: string
    }
    name: string
    tags: {
        [key: string]: string
    }
    timestamp: number
}

const ajv = new Ajv();
const validate = ajv.compile(telegraf_json_schema);

@Controller("/v1/telegraf", "input-server")
export class InputTelegraf {

    constructor (
        private readonly _app_id: string,
        private readonly _name: string,
        private readonly _prefix: string,
        private readonly _logger: ILogger = <ILogger>Catalog(Logger),
        private readonly _metrics_store: IMetricsStore = <IMetricsStore>Catalog(MetricsStore)
    )  {
        this._logger.info(`[${this._app_id}] Controller ${chalk.gray(this._name)} assigned to application with prefix ${chalk.gray(this._prefix)}`, "dev");
    }

    _updateMetric (metric: TTelegraf, table_tag: string): void {

        if (metric.timestamp < 1000000000000) {
            metric.timestamp = metric.timestamp*1000;
        }

        if (metric.tags[table_tag] === undefined) {
            throw new Error(`Request not contain tag ${table_tag}`);
        }

        const table_name = metric.tags[table_tag].toLowerCase();
        const db_name = metric.name.toLowerCase();

        let record_id = "";

        for (const tag_name in metric.tags) {
            if (tag_name !== table_tag) {
                record_id += `.${metric.tags[tag_name].toLowerCase()}`; 
            }
        }

        if (record_id === "") {
            record_id = "default";
        }

        record_id = record_id.replace(/^\./, "");

        this._metrics_store.update(db_name, table_name, record_id, metric);

    }

    @Post("/json", "input-server")
    async json (ctx: Context, next: Next): Promise<void> {

        const config = ctx.koad.config.receivers.telegraf_json;

        if (config.enable === false) {
            return next();
        }
     
        if (ctx.request.body === undefined) {
            throw new Error("Request body empty");
        }

        const valid = validate(ctx.request.body);

        if (!valid) {
            throw new Error(`Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
        }

        if (ctx.request.body.metrics === undefined) {
            this._updateMetric(ctx.request.body, config.table_tag);
        } else {
            const metrics = ctx.request.body.metrics;
            for (const metric of metrics) {
                this._updateMetric(metric, config.table_tag);
            }
        }

        ctx.status = 200;

    }

}