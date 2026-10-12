import { Vector } from "@vivalence/typology";

export const close = new Vector().open({ nature: "/key/ctrl-b", valence: "ctrl-b closes the buffer. Example: { key: 'ctrl-b' }" }, (ctx) => ctx.client.dispatch("/buffer/close"));
