import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Held = v.object({
  held: v.enum(["entity", "activity", "harness", "display", "system"]).desc('The segment whose widget the modeline floats; the same one again closes it. Example: "entity"'),
  anchor: v.integer({ minimum: 0 }).optional().desc("The column the popover opens at; absent, above its segment. Example: 5"),
});

const HELD = [
  [(popover, held) => popover !== null && popover.held === held, () => null],
  [() => true, (popover, held, anchor) => ({ held, anchor })],
];

export const popover = new Vector()
  .open(
    { nature: "/popover", valence: "float a segment's widget above the modeline; the same segment again closes it. Example: /popover entity 5", input: Held },
    (ctx) => {
      const { held, anchor } = belt.input.cast(Held, ctx.signal);
      const popover = HELD.find(([test]) => test(ctx.client.app.bridge.popover, held))[1](ctx.client.app.bridge.popover, held, anchor);
      ctx.client.app.bridge.$popover.set(popover);
      return popover === null ? "popover closed" : `popover ${held}`;
    },
  )
  .open(
    { nature: "/popover/close", valence: "drop the modeline's popover. Example: /popover/close" },
    (ctx) => {
      ctx.client.app.bridge.$popover.set(null);
      return "popover closed";
    },
  );
