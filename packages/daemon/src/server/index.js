import { Application } from "https://deno.land/x/oak@v12.5.0/mod.ts";

import cors from "./cors.js";

// Assuming you have a locals.js file with similar functionality
// import { locals } from "./locals.js";

// import path from "path";
// import { nlp, llm, vfetch } from "@vivalence/services/server";
// import * as ontology from "./ontology";
// import * as api from "./api";
// import createSupabaseClient from "./supabase";

// const { PUBLIC_CLIENT_URL } = process.env;

async function locals(ctx, next) {
    const locals = {};

    locals.nlp = nlp;
    locals.llm = llm;

    locals.supabase = createSupabaseClient(ctx);
    locals.getUser = async () => {
        const { data } = await locals.supabase.auth.getUser();
        return data.user;
    };
    locals.getSession = async () => {
        const { data } = await locals.supabase.auth.getSession();
        return data.session;
    };
    locals.session = await locals.getSession();

    locals.user = await locals.getUser();

    locals.self = { api, ontology };

    locals.client = vfetch({
        basePath: path.join(PUBLIC_CLIENT_URL, "api"),
        session: locals.session
    });

    ctx.locals = locals;

    await next();
}

export default async function server(params) {
    const app = new Application();

    app.use(cors);
    // app.use(locals);
    app.use(auth);

    return { ...params, app };
}
