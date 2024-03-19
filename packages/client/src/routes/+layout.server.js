import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

console.log("layout.server.js", env);
export const load = async ({ route, locals: { getSession }, ...params }) => {
    const session = await getSession();

    console.log("rendering layout.server.js", env, route);
    if (!session && route.id !== "/auth")
        throw redirect(307, `${env.PUBLIC_VIVALENCE_AUTH_URL}?redirect=${route.path}`);

    return { session };
};
