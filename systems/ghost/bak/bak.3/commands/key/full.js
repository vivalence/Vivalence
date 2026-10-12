import { Vector } from "@vivalence/typology";

export const full = new Vector().open({ nature: "/key/ctrl-f", valence: "ctrl-f toggles the dock over the stage. Example: { key: 'ctrl-f' }" }, (ctx) => ctx.client.dispatch("/dock/full"));
