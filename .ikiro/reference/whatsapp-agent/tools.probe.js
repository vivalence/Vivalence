import { v, Vector } from "@vivalence/typology";

const sent = [];
const bots = { whatsapp: { send: (to, text) => sent.push({ to, text }) } };
const owner = { whatsapp: "4915100000000" };

export const tell = new Vector().open(
  {
    nature: "/tell",
    valence: "Send the owner a message on their messenger. Example: /tell 'the report is ready'",
    input: v.object({ text: v.string().desc("the message, plain text").example("the report is ready") }),
  },
  (ctx) => bots.whatsapp.send(owner.whatsapp, ctx.input.text),
);

export const send = new Vector().open(
  {
    nature: "/send",
    valence: "Send anyone a message on a messenger. Example: /send whatsapp 4915100000000 'hi'",
    input: v.object({
      platform: v.string().desc("the messenger").example("whatsapp"),
      to: v.string().desc("the recipient's address there").example("4915100000000"),
      text: v.string().desc("the message, plain text").example("hi"),
    }),
  },
  (ctx) => bots[ctx.input.platform].send(ctx.input.to, ctx.input.text),
);

import { steer, Signal } from "@vivalence/typology";
await steer.dispatch.execute(tell, { input: { text: "the report is ready" } }, new Signal("/tell"));
await steer.dispatch.execute(send, { input: { platform: "whatsapp", to: "4917000000000", text: "hi" } }, new Signal("/send"));
console.log(JSON.stringify(sent));
