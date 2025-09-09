import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { isIdentified } from "@client/app";

export const ssr = false;

export const load = async (event) => {
  if (event.url.pathname !== "/" && !isIdentified()) redirect(307, "/");
};
