import createCall from "$lib/call.js";

export const handle = async ({ event, resolve, ...props }) => {
  event.locals = event.locals || {};

  event.identity = { getUser: async () => ({ id: "localhost" }) };
  event.locals.getUser = event.identity.getUser;

  event.locals.call = createCall(event);
  event.aperture = { call: event.locals.call.wrap("/aperture") };

  return resolve(event, {
    filterSerializedResponseHeaders: (name) => name === "content-range",
  });
};
