import { Vector } from "@vivalence/typology";

export const pick = new Vector().open({ nature: "/key/ctrl-p", valence: "ctrl-p picks a mode for the active terminal. Example: { key: 'ctrl-p' }" }, (ctx) => ctx.client.dispatch("/mode"));
