import { Vector } from "@vivalence/typology";
import * as surface from "../../surface/index.js";

export const chrome = new Vector()
  .open(
    {
      nature: "/chrome/on",
      valence: "paint the dock over this terminal; the transcript stays. Example: /chrome/on",
    },
    async (ctx) => {
      ctx.client.unmount();
      ctx.client.unmount = await surface.chrome(ctx.client);
      return "chrome on";
    },
  )
  .open(
    {
      nature: "/chrome/off",
      valence: "drop to the plain repl; the transcript stays. Example: /chrome/off",
    },
    async (ctx) => {
      ctx.client.unmount();
      ctx.client.unmount = await surface.repl(ctx.client);
      return "chrome off";
    },
  );
