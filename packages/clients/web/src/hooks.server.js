import supabase from "$lib/server/supabase.js";
import createCall from "$lib/call.js";

export const handle = async ({ event, resolve, ...props }) => {
  event.locals = event.locals || {};
  event.data = event.data || {};

  event.locals.getUser = async () => {
    const { data, error } = await event.locals.supabase.auth.getUser();
    return data.user;
  };
  event.locals.getSession = async () => {
    const { data } = await event.locals.supabase.auth.getSession();
    return data.session;
  };

  event.locals.supabase = supabase(event);
  await event.locals.getSession();
  event.data.session = await event.locals.getSession();

  event.locals.call = createCall(event);

  return resolve(event, {
    filterSerializedResponseHeaders: (name) => name === "content-range",
  });
};
