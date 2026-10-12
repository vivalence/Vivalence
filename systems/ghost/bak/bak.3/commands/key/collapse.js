import { Vector } from "@vivalence/typology";

export const collapse = new Vector().open({ nature: "/key/ctrl-n", valence: "ctrl-n collapses the dock. Example: { key: 'ctrl-n' }" }, (ctx) => ctx.client.dispatch("/dock/collapse"));
