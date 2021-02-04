import { 
    IMetricsStoreTableRecord, 
    IMetricsStoreTableRecordConfig, 
    IMetricsStoreTableRecordFields, 
    IMetricsStoreTableRecordTags 
} from "../interfaces";

export class MetricsStoreTableRecord implements IMetricsStoreTableRecord {

    constructor (
        private readonly _id: string,
        private readonly _config: IMetricsStoreTableRecordConfig
    ) {}
    
    get id (): string {
        return this._id;
    }

    get timestamp (): number {
        return this._config.timestamp;
    }

    get fields (): IMetricsStoreTableRecordFields {
        return this._config.fields;
    }

    get tags (): IMetricsStoreTableRecordTags {
        return this._config.tags;
    }

    get json (): IMetricsStoreTableRecordConfig {
        return this._config;
    }
}