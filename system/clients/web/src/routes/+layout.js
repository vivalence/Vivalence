import { redirect } from "@sveltejs/kit";
import { auth } from "@client/auth";

export const ssr = false;

export const load = async (event) => {
  if (event.url.pathname !== "/" && !auth.isIdentified) redirect(307, "/");
};
