import { redirect } from "@sveltejs/kit";

export const load = async ({ route, locals, ...params }) => {
  const user = await locals.getUser();

  if (!user && route.id !== "/auth") {
    throw redirect(307, `/auth`);
  }

  const { data: runtimes, error } = await locals.call("/api/user/runtimes/view");
  if (error) throw error;

  return { user, runtimes };
};
