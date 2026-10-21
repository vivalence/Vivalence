import { Vector, v } from "@vivalence/typology";
import { THEMES } from "@vivalence/dapper";
import * as belt from "../../../gestalten/belt/index.js";

const Named = v.object({
  theme: v.enum(Object.keys(THEMES)).optional().desc('A dapper theme; absent, the next one after the current. Example: "northsea"'),
});

const NAMED = [
  [(theme) => theme === undefined, (app) => Object.keys(THEMES)[(Object.keys(THEMES).indexOf(app.theme) + 1) % Object.keys(THEMES).length]],
  [() => true, (app, theme) => theme],
];

export const theme = new Vector().open(
  { nature: "/theme/set", valence: "the chrome's theme for this session; bare, the next one. Example: /theme/set northsea", input: Named, chord: "leader/d/t" },
  (ctx) => {
    const named = belt.input.cast(Named, ctx.signal).theme;
    const theme = NAMED.find(([test]) => test(named))[1](ctx.client.app, named);
    ctx.client.app.bridge.$theme.set(theme);
    return `theme ${theme}`;
  },
);
