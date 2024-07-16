import { isBrowser } from "@supabase/ssr";
import { handle } from "../hooks.client.js";

export const load = async (params) => {
  return await handle(params);
};
