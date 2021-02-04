import { IApiServerConfig, IInputServerConfig, IWebServerConfig } from "../http";
import { ILoggerConfig } from "logger-flx";
import { IAuthorizationConfig } from "./authorization";
import { IMetricsStoreConfig } from "./metrics-store";
import { INotificationsConfig } from "./notifications";
import { ITemporaryStoreConfig } from "./temporary-store";
import { IHandlersConfig } from "./handlers";

export interface IAppConfig {
    logger: ILoggerConfig
    api: IApiServerConfig
    web: IWebServerConfig
    input: IInputServerConfig
    authorization: IAuthorizationConfig
    metrics_store: IMetricsStoreConfig
    notifications: INotificationsConfig
    store: ITemporaryStoreConfig
    handlers: IHandlersConfig
}