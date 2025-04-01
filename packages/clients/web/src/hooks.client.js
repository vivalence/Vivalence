import createCall from "@vivalence/local-lib/call.js";
import { browser } from "$app/environment";

let ctx;

export const handle = async (event) => {
  if (!ctx) {
    ctx = {
      event,
      locals: {},
      identity: {},
      call: null,
      // entities
      // aperture
    };

    ctx.identity = { getUser: async () => await Promise.resolve({ id: "localhost" }) };
    ctx.call = createCall({});
  }

  if (browser && !window.viva) {
    window.viva = ctx;
  }

  ctx.daemon = ctx.call.wrap("/aperture/v1/daemon");

  if (event?.params.runtime) {
    ctx.runtime = ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}`);
  }

  return ctx;
};

export default handle;
