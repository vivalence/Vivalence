import { browser } from "$app/environment";
import createCall from "./lib/call.js";
import { Trajectory, parsers } from "@vivalence/trajectory";

let ctx;

function context(event) {
  if (!ctx) {
    ctx = {
      event,
      locals: {},
      identity: {},
      call: null,
      runtime: null,
      daemon: null,
      // todo: rename vector
      trajectory: new Trajectory([parsers.key]),
    };

    // ctx.client.trajectory.branch((p) => p.key("p"));

    ctx.identity = {
      getUser: async () => await Promise.resolve({ id: "localhost" }),
    };
    ctx.call = createCall({});
    ctx.daemon = { call: ctx.call.wrap("/aperture/v1/daemon") };

    if (browser && !window.viva) {
      window.viva = ctx;
    }
  }

  if (event?.params.runtime) {
    ctx.runtime = {
      call: ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}`),
    };

    if (event?.params.game) {
      ctx.game = {
        call: ctx.call.wrap(
          `/aperture/v1/runtime/${event.params.runtime}/game/${event.params.game}`,
        ),
      };
    }
  }

  return ctx;
}

export default context;
