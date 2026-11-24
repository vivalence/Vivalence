import { Vector, v } from "@vivalence/typology";
import { FONTS } from "@vivalence/dapper";
import * as belt from "../../belt/index.js";

const Sized = v.object({
  font: v.enum(Object.keys(FONTS)).desc('A step of the root type ladder. Example: "lg"'),
});

export const font = new Vector().open(
  {
    nature: "/font/set",
    rank: "hidden",
    valence: "the chrome's type size, kept on this device; every rem follows it. Example: /font/set lg",
    input: Sized,
  },
  (ctx) => {
    const font = belt.input.cast(Sized, ctx.signal).font;
    ctx.client.app.bridge.$font.set(font);
    return `font ${font}`;
  },
);
