import createCall from "@vivalence/local-lib/call.js";

export const handle = async (event) => {
  const ctx = {
    event,
    locals: {},
    identity: {},
    call: null,
    // entities
    // aperture
  };

  ctx.identity = { getUser: async () => await Promise.resolve({ id: "localhost" }) };

  ctx.call = createCall({});

  return ctx;
};
