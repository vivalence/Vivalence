import { redirect } from "@sveltejs/kit";

export const load = async ({ route, locals, ...params }) => {
  const user = await locals.getUser();
  const session = await locals.getSession();

  if (!user && route.id !== "/auth") {
    throw redirect(307, `/auth`);
  }

  return { session, user };
};
