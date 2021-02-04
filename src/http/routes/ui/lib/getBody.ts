import Handlebars from "handlebars";
import * as fs from "fs";

type TTemplateCache = {
    [key: string]: HandlebarsTemplateDelegate<unknown>
}

const template_cache: TTemplateCache = {};

Handlebars.registerHelper("lifetime", (time: number) => {
    if (typeof time === "number") {
        return ((Date.now() - time)/1000).toFixed(0);
    }
    return "";
});

Handlebars.registerHelper("if_eq", (a, b, opts) => {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

export async function getBody (template_path: string, data: unknown): Promise<string> {

    if (template_cache[template_path] === undefined) {
        const template_body = (await fs.promises.readFile(template_path)).toString();
        template_cache[template_path] = Handlebars.compile(template_body);
    }

    const template = template_cache[template_path];
    return template(data);

}