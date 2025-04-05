import createCall from "@client/lib/call.js";
import { browser } from "$app/environment";

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
}

export default context;
