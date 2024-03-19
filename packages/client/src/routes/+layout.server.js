import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

export const load = async ({ route, locals: { getSession }, ...params }) => {
    const session = await getSession();

    console.log("session", session);
    console.log("route", route);
    console.log("env", env);
    if (!session && route.id !== "/auth")
        throw redirect(307, `${env.PUBLIC_VIVALENCE_AUTH_PATH}?redirect=${route.path}`);

    return { session };
};
