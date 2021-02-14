import Handlebars from "handlebars";
import * as fs from "fs";

type TTemplateCache = {
    [key: string]: HandlebarsTemplateDelegate<unknown>
}

const template_cache: TTemplateCache = {};

Handlebars.registerHelper("if_eq", (a, b, opts) => {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper("timestamp", (time: number) => {
    if (typeof time !== "number") {
        return "";
    }
    return (new Date(time)).toString();
});

Handlebars.registerHelper("timestamp_human", (time: number, time_zone: number = 0) => {
    if (typeof time !== "number") {
        return "";
    }
    
    const now = new Date(time);

    let hours = now.getHours() + time_zone;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (hours > 23) {
        hours -= 24;
    }

    if (hours < 0) {
        hours += 24;
    }

    let txt_hours = `${hours}`;
    let txt_minutes = `${minutes}`;
    let txt_seconds = `${seconds}`;

    if (hours < 10) {
        txt_hours = `0${hours}`;
    }
    if (minutes < 10) {
        txt_minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        txt_seconds = `0${seconds}`;
    }

    return `${txt_hours}:${txt_minutes}:${txt_seconds}`;

});

export function checkTemplate (template_path: string): void {
    const template_body = fs.readFileSync(template_path).toString();
    const template = Handlebars.compile(template_body);
    template({});
}

export async function getBody (template_path: string, data: unknown): Promise<string> {

    if (template_cache[template_path] === undefined) {
        const template_body = (await fs.promises.readFile(template_path)).toString();
        template_cache[template_path] = Handlebars.compile(template_body);
    }

    const template = template_cache[template_path];
    return template(data);

}