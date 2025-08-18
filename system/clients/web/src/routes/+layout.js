import { redirect } from "@sveltejs/kit";
import { authority } from "@client/authority";

export const ssr = false;

export const load = async (event) => {
  if (event.url.pathname !== "/" && !authority.isIdentified) redirect(307, "/");
};
