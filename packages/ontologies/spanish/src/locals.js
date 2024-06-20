import path from "path";
import { createServerClient } from "@supabase/ssr";
import { nlp, llm } from "@vivalence/services";
import * as ontology from "./ontology";
import * as api from "./api";

const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = process.env;
const { PUBLIC_CLIENT_URL } = process.env;

const vfetch = (params) => {
    // @lj duplication due to SSR fetch&path complications
    return (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(params.cookie && { Cookie: params.cookie })
            },
            body: JSON.stringify(body),
            credentials: "include"
        };

        const request = (params.fetch || fetch)(path.join(params.basePath, url), options);

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error || !json.data) throw new Error(json.error || "No data found");
                return json.data;
            } catch (err) {
                console.error("[ONTOLOGY FETCH ERROR]");
                console.error(err);
                console.error(params);
                console.error(url, options);
                console.error("[/ONTOLOGY FETCH ERROR]");
                throw err;
            }
        };
        const single = async () => {
            const items = await ok();
            if (items[0]) return items[0];
            else throw new Error("No single data found");
        };
        const response = async () => await request;

        return {
            request,
            response,
            ok,
            single
        };
    };
};

export default async function (ctx, next) {
    ctx.locals = {};

    ctx.locals.nlp = nlp;
    ctx.locals.llm = llm;

    ctx.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => {
                console.log("cookies key", key);
                console.log("ctx.headers.cookies", ctx.headers.cookie);
                const cookie = ctx.cookies.get(key);
                return decodeURIComponent(cookie);
            },
            set: (key, value, options) => {
                if (!ctx.response) return;
                ctx.cookies.set(key, encodeURIComponent(value), {
                    ...options,
                    httpOnly: true,
                    sameSite: "Lax"
                });
            },
            remove: (key, options) => {
                if (!ctx.response) return;
                ctx.cookies.set(key, "", { ...options, expires: new Date(0) });
            }
        }
    });

    ctx.locals.self = { api, ontology };

    ctx.locals.client = vfetch({
        basePath: path.join(PUBLIC_CLIENT_URL, "api"),
        cookie: ctx.headers.cookie
    });

    await next();
}
