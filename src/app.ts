import config from "./lib/entry";
import { Logger } from "./lib/logger";
import { Singleton } from "di-ts-decorators";
import { KoaD } from "koa-ts-decorators";
import { Authorization } from "./lib/authorization";

console.log(JSON.stringify(config, null, 4));

import "./http";

const logger = new Logger(config.logger);
const authorization = new Authorization(config.authorization);

Singleton("config", config);
Singleton(Logger.name, logger);

const api_server = new KoaD(config.api, "api-server");

const bootstrap = async () => {

    try {

        api_server.context.authorization = authorization;

        await api_server.listen( () => {
            logger.info(`[api-server] listening on network interface ${api_server.config.listening}${api_server.prefix}`);
        });

    } catch (error) {
        logger.error(error.message);
        logger.red(error.stack);
        process.exit(1);
    }

};

bootstrap();

process.on("SIGTERM", () => {
    console.log("💀 Termination signal received 💀");
    process.exit();
});