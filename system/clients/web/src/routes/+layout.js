import { redirect } from "@sveltejs/kit";
import { auth } from "@client/app";

export const ssr = false;

export const load = async (event) => {
  if (event.url.pathname !== "/login" && !auth.isIdentified)
    redirect(307, "/login");
};
