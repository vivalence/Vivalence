import { redirect } from "@sveltejs/kit";

export const load = async ({ route, locals: { getSession }, ...params }) => {
    const session = await getSession();

    if (!session && route.id !== "/auth") throw redirect(307, "/auth");

    return {
        session
    };
};
