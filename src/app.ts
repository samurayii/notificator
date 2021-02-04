import config from "./lib/entry";
import { Logger } from "logger-flx";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";
import * as chalk from "chalk";
import { MetricsStore } from "./lib/metrics-store";
import { Notifications } from "./lib/notifications";
import { TemporaryStore } from "./lib/temporary-store";
import { Handlers } from "./lib/handlers";

import "./http";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);
const metrics_store = new MetricsStore(config.metrics_store, logger);
const temporary_store = new TemporaryStore(config.store, logger);
const notifications = new Notifications(config.notifications, logger);
const handlers = new Handlers(config.handlers, notifications, metrics_store, temporary_store, logger);

Singleton("config", config);
Singleton(Logger.name, logger);
Singleton(MetricsStore.name, metrics_store);
Singleton(Notifications.name, notifications);
Singleton(Handlers.name, handlers);
Singleton(TemporaryStore.name, temporary_store);

const api_server = new KoaD(config.api, "api-server");
const web_server = new KoaD(config.web, "web-server");
const input_server = new KoaD(config.input, "input-server");

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;
        web_server.context.authorization = authorization;
        input_server.context.authorization = authorization;

        metrics_store.run();
        await handlers.run();

        await api_server.listen( () => {
            logger.info(`[api-server] listening on network interface ${chalk.gray(`${api_server.config.listening}${api_server.prefix}`)}`);
        });
        
        await web_server.listen( () => {
            logger.info(`[web-server] listening on network interface ${chalk.gray(`${web_server.config.listening}${web_server.prefix}`)}`);
        });

        await input_server.listen( () => {
            logger.info(`[input-server] listening on network interface ${chalk.gray(`${input_server.config.listening}${input_server.prefix}`)}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.log(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", () => {
    logger.log("Termination signal received");
    api_server.close();
    input_server.close();
    web_server.close();
    metrics_store.stop();
    setInterval( () => {
        process.exit();
    }, 2000);
});