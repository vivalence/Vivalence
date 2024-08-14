import { env } from "$env/dynamic/public";
import { isBrowser } from "@supabase/ssr";
import supabase from "$lib/supabase.js";
import createCall from "$lib/call.js";

export const handle = async (event) => {
  event.locals = event.locals || {};
  event.data = event.data || {};
  event.locals.supabase = supabase(event);

  event.locals.getUser = async () => {
    const { data } = await event.locals.supabase.auth.getUser();
    return data.user;
  };
  event.locals.getSession = async () => {
    const { data } = await event.locals.supabase.auth.getSession();
    return data.session;
  };

  const call = createCall({});
  event.locals.wrapCall = (root) => (path, body, params) => call(`${root}${path}`, body, params);
  event.locals.call = call;

  event.data.session = await event.locals.getSession();
  return event;
};
