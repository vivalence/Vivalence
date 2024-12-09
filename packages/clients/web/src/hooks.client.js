import createCall from "$lib/call.js";

export const handle = async (event) => {
  event.data = event.data || {};
  event.locals = event.locals || {};

  event.identity = { getUser: async () => ({ id: "localhost" }) };
  event.locals.getUser = event.identity.getUser;

  // i should differentiate between aperture call and daemon/runtime call
  event.locals.call = createCall({});
  event.aperture = { call: event.locals.call.wrap("/aperture") };

  return event;
};
