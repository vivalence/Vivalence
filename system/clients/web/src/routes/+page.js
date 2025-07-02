import context from "@client/context";
import { env } from "$env/dynamic/public";

export const load = async (event) => {
  const ctx = await context(event);

  //
  return { ctx };
};
