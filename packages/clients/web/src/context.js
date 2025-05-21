import { browser } from "$app/environment";
import createCall from "./lib/call.js";

let ctx;

// function keybindings(map) {
//   window.removeEventListener("keydown", keyhandler);
//   keyhandler = createKeybindingsHandler(map);
//   window.addEventListener("keydown", keyhandler);
// }

// !important to hook into layout.
// onMount(() => {
//   return () => {
//     window.removeEventListener("keydown", keyhandler);
//   };
// });

function context(event) {
  if (!ctx) {
    ctx = {
      event,
      locals: {},
      identity: {},
      call: null,
      runtime: null,
      daemon: null,
      // entities
      // trajectory
    };

    ctx.identity = {
      getUser: async () => await Promise.resolve({ id: "localhost" }),
    };
    ctx.call = createCall({});
    ctx.daemon = ctx.call.wrap("/aperture/v1/daemon");

    if (browser && !window.viva) {
      window.viva = ctx;
    }
  }

  if (event?.params.runtime) {
    ctx.runtime = ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}`);

    if (event?.params.game) {
      ctx.game = ctx.call.wrap(
        `/aperture/v1/runtime/${event.params.runtime}/game/${event.params.game}`,
      );
    }
  }

  return ctx;
}

export default context;
