import { program } from "commander";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as finder from "find-package-json";
import Ajv from "ajv";
import jtomler from "jtomler";
import json_from_schema from "json-from-default-schema";
import * as auth_user_schema from "./schemes/auth_user.json";
import * as config_schema from "./schemes/config.json";
import * as telegram_channel_schema from "./schemes/telegram_channel.json";
import * as email_channel_schema from "./schemes/email_channel.json";
import { IAppConfig } from "./config.interface";
import { IChannelConfig, IEmailChannelConfig, ITelegramChannelConfig } from "./notifications";
 
const pkg = finder(__dirname).next().value;

program.version(`version: ${pkg.version}`, "-v, --version", "output the current version.");
program.name(pkg.name);
program.option("-c, --config <type>", "Path to config file.");

program.parse(process.argv);

if (process.env["NOTIFICATOR_CONFIG_PATH"] === undefined) {
	if (program.config === undefined) {
		console.error(`${chalk.red("[ERROR]")} Not set --config key`);
		process.exit(1);
	}
} else {
	program.config = process.env["NOTIFICATOR_CONFIG_PATH"];
}

const full_config_path = path.resolve(process.cwd(), program.config);

if (!fs.existsSync(full_config_path)) {
    console.error(`${chalk.red("[ERROR]")} Config file ${full_config_path} not found`);
    process.exit(1);
}

const config: IAppConfig = <IAppConfig>json_from_schema(jtomler(full_config_path), config_schema);

for (const item of config.authorization.users) {

    const ajv_item = new Ajv({
        strict: false
    });
    const validate = ajv_item.compile(auth_user_schema);

    if (!validate(item)) {
        console.error(`${chalk.red("[ERROR]")} Config authorization.users parsing error. Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
        process.exit(1);
    }

}

const getChannelFilesList = (folder: string, files_list: string[]  = []) => {

    const files = fs.readdirSync(folder);

    for (const file_path of files) {

        const full_file_path = path.resolve(folder, file_path);
        const stat = fs.statSync(full_file_path);

        if (stat.isFile()) {
            if (/(\.yml|\.toml|\.json)$/.test(file_path)) {
                files_list.push(full_file_path);
            }
        } else {
            getChannelFilesList(full_file_path, files_list);
        }

    }

    return files_list;

};

const channels_full_path = path.resolve(process.cwd(), config.notifications.path);

if (fs.existsSync(channels_full_path) === false) {
    fs.mkdirSync(channels_full_path, {
        recursive: true
    });
}

const channels_files = getChannelFilesList(channels_full_path);

for (const channel_file_path of channels_files) {
    const channel_json = <IChannelConfig>jtomler(channel_file_path);
    config.notifications.channels.push(channel_json);
}

let i = 0;

for (let channel_json of config.notifications.channels) {

    let validate;
    const ajv_item = new Ajv({
        strict: false
    });

    if (channel_json.type === "telegram") {
        channel_json = <ITelegramChannelConfig>json_from_schema(channel_json, telegram_channel_schema);
        validate = ajv_item.compile(telegram_channel_schema);
    }

    if (channel_json.type === "email") {
        channel_json = <IEmailChannelConfig>json_from_schema(channel_json, email_channel_schema);
        validate = ajv_item.compile(email_channel_schema);
    }

    if (validate === undefined) {
        console.error(`${chalk.red("[ERROR]")} Notification channel type ${channel_json.type} not support`);
        process.exit(1);
    }

    if (!validate(channel_json)) {
        console.error(`${chalk.red("[ERROR]")} Config channel parsing error. Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
        process.exit(1);
    }

    config.notifications.channels[i] = channel_json;

    i++;

}

const ajv = new Ajv({
    strict: false
});
const validate = ajv.compile(config_schema);

if (!validate(config)) {
    console.error(`${chalk.red("[ERROR]")} Schema errors:\n${JSON.stringify(validate.errors, null, 2)}`);
    process.exit(1);
}

export default config;
