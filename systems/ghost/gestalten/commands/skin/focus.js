import { Vector, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const HOLDERS = {
  dock: "dock.input",
  frame: "frame.surface",
};

const Focused = v.object({
  panel: v.enum(["dock", "frame"]).optional().desc('The panel the keys go to; absent, the frame if the dock holds them, else the dock. Example: "frame"'),
});

const FLIPPED = [
  [(focus) => focus === "frame.surface", () => "dock"],
  [() => true, () => "frame"],
];

export const focus = new Vector().open(
  { nature: "/focus", rank: "hidden", valence: "the keys to a panel — the frame's mode surface, or the dock's textarea; bare, they flip between the two. Example: /focus frame", input: Focused, chord: "leader/d/f" },
  (ctx) => {
    const { panel } = belt.input.cast(Focused, ctx.signal);
    const held = panel === undefined ? FLIPPED.find(([test]) => test(ctx.client.app.bridge.focus))[1]() : panel;
    ctx.client.app.bridge.$focus.set(HOLDERS[held]);
    return `keys to the ${held}`;
  },
);
