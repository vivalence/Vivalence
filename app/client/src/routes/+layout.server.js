import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

export const load = async ({ route, locals: { getSession }, ...params }) => {
    const session = await getSession();

    if (!session && route.id !== "/auth") {
        // if (env.PUBLIC_SYSTEM_MODE && +env.PUBLIC_SYSTEM_MODE > 2)
        throw redirect(307, `/auth`);
    }

    return { session };
};
