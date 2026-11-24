import { v, Vector } from "@vivalence/typology";
import { meta } from "./graph.js";
import { numbers } from "./provider.js";

const number = v
  .string()
  .desc("the phone number id of a number this instance serves")
  .example("106540352242922");

const served = (id) => {
  if (!numbers.has(id)) throw new Error(`whatsapp: no bot here serves number ${id}`);
  return meta(numbers.get(id).service);
};

export const aperture = new Vector()
  .open(
    {
      nature: "/numbers",
      valence: "Returns the phone number ids this instance serves.",
      input: v.object({}),
    },
    () => [...numbers.keys()],
  )
  .open(
    {
      nature: "/state",
      valence: "Returns Meta's record of a number: its status and its webhook URLs.",
      input: v.object({ number }),
    },
    (ctx) => served(ctx.input.number).state(),
  )
  .open(
    {
      nature: "/token",
      valence: "Returns Meta's record of a number's Graph token: validity, expiry and scopes.",
      input: v.object({ number }),
    },
    (ctx) => served(ctx.input.number).token(),
  )
  .open(
    {
      nature: "/claim",
      valence: "Sets the webhook URL Meta delivers a number's messages to.",
      input: v.object({
        number,
        hook: v
          .string()
          .desc("the public URL of this instance's webhook")
          .example("https://x.trycloudflare.com/attached/process/service/service/whatsapp/webhook"),
      }),
    },
    (ctx) => served(ctx.input.number).claim(ctx.input.hook, ctx.mask.secrets.verify),
  );
