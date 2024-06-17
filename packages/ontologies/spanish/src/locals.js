import path from "path";
import { createServerClient } from "@supabase/ssr";
import { nlp, llm } from "@vivalence/services";
import * as ontology from "./ontology";
import * as api from "./api";

const { SERVER_SUPABASE_URL, SERVER_SUPABASE_ANON_KEY } = process.env;
const { SERVICE_NLP_URL, SERVICE_NLP_KEY } = process.env;
const { GROQ_API_KEY, OPENAI_API_KEY } = process.env;
const { SERVER_CLIENT_URL } = process.env;

export default async function (ctx, next) {
    ctx.locals = {};

    ctx.locals.nlp = nlp(SERVICE_NLP_URL, SERVICE_NLP_KEY);
    ctx.locals.llm = llm({ openai: OPENAI_API_KEY });
    ctx.locals.supabase = createServerClient(SERVER_SUPABASE_URL, SERVER_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => {
                const cookie = ctx.cookies.get(key);
                return decodeURIComponent(cookie);
            },
            set: (key, value, options) => {
                if (!ctx.response) return;
                ctx.cookies.set(key, encodeURIComponent(value), {
                    ...options,
                    sameSite: "Lax",
                    httpOnly: true
                });
            },
            remove: (key, options) => {
                if (!ctx.response) return;
                ctx.cookies.set(key, "", { ...options, httpOnly: true });
            }
        }
    });

    ctx.locals.self = { api, ontology };

    ctx.locals.client = (url, body) => {
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json", cookie: ctx.headers.cookie },
            body: JSON.stringify(body)
        };
        const request = fetch(path.join(SERVER_CLIENT_URL, "api", url), options);

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error) throw new Error(json.error);
                if (!json.data) throw new Error("No data found");
                return json.data;
            } catch (err) {
                console.error("[FETCH ERROR]");
                console.error(url);
                console.error(options);
                console.error(err);
                console.error("[/FETCH ERROR]");
                throw new Error(err);
            }
        };
        const single = async () => {
            const items = await ok();
            if (!items[0]) {
                console.error("[FETCH ERROR]");
                console.error(url);
                console.error(options);
                console.error(items);
                console.error("No single data found");
                console.error("[/FETCH ERROR]");
                throw new Error("No single data found");
            }
            return items[0];
        };
        const response = async () => await request;

        return {
            request,
            response,
            ok,
            single
        };
    };

    await next();
}
