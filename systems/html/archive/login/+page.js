import { goto } from "$app/navigation";
import { auth } from "@client/app";

export const ssr = false;

export const load = async (event) => {
  if (auth.isIdentified && (await auth.verify())) {
    goto("/");
  }
};
