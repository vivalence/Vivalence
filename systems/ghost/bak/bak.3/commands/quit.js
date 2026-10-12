import { Vector } from "@vivalence/typology";

export const quit = new Vector().open({ nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" }, (ctx) => ctx.controller.kill("SIGTERM", "quit"));
