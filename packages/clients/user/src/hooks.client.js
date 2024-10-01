import { isBrowser } from "@supabase/ssr";
import supabase from "$lib/supabase.js";
import createCall from "$lib/call.js";

export const handle = async (event) => {
  event.data = event.data || {};
  event.locals = event.locals || {};

  event.locals.getUser = async () => {
    const { data } = await event.locals.supabase.auth.getUser();
    return data.user;
  };
  event.locals.getSession = async () => {
    const { data } = await event.locals.supabase.auth.getSession();
    return data.session;
  };

  event.locals.call = createCall({});
  event.locals.supabase = supabase(event);
  event.data.session = await event.locals.getSession();

  return event;
};
