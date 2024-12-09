import { redirect } from "@sveltejs/kit";

export const load = async ({ aperture, identity, ...params }) => {
  const user = await identity.getUser();

  // if (!user && route.id !== "/auth") {throw redirect(307, `/auth`);}

  const { data: runtimes, error } = await aperture.call("/runtimes/available");
  if (error) throw error;
  return { user, runtimes };
};
