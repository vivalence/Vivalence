import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const PANELS = ["composer", "frame"];

const Focused = v.object({
  panel: v.enum(PANELS).optional().desc('The panel the keys go to; absent, the frame if the composer holds them, else the composer. Example: "frame"'),
});

const FLIPPED = [
  [(focus) => focus === "frame", () => "composer"],
  [() => true, () => "frame"],
];

export const focus = new Vector().open(
  { nature: "/focus", valence: "the keys to a panel — the frame's mode view, or the dock's composer; bare, they flip between the two. Example: /focus frame", input: Focused, chord: "leader/d/f" },
  (ctx) => {
    const { panel } = belt.input.cast(Focused, ctx.signal);
    const held = panel === undefined ? FLIPPED.find(([test]) => test(ctx.client.app.bridge.focus))[1]() : panel;
    ctx.client.app.bridge.$focus.set(held);
    return `keys to the ${held}`;
  },
);
