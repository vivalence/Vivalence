import { shard, steer, v, Vector } from "@vivalence/typology";
import { meta } from "../../../commons/social/whatsapp/graph.js";

export const aperture = new Vector()
  .open(
    {
      nature: "/state",
      valence:
        "How Meta sees this number: whether it can send, and which webhook Meta delivers to. " +
        "Example: {}",
      input: v.object({}),
    },
    (ctx) => meta(ctx.mask).state(),
  )
  .open(
    {
      nature: "/token",
      valence: "Meta's own reading of the Graph token: validity, expiry, scopes. Example: {}",
      input: v.object({}),
    },
    (ctx) => meta(ctx.mask).token(),
  )
  .open(
    {
      nature: "/claim",
      valence:
        "Point Meta's deliveries for this number at a webhook of ours. Meta calls it at once, " +
        "so it must already answer. The app's own callback is left alone.",
      input: v.object({
        hook: v
          .string()
          .desc("the public URL of this instance's webhook")
          .example("https://x.trycloudflare.com/attached/process/service/service/whatsapp/webhook"),
      }),
    },
    (ctx) => meta(ctx.mask).claim(ctx.input.hook, ctx.mask.secrets.verify),
  );

const env = Object.fromEntries(
  Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/instances/localhost/.env`)
    .split("\n")
    .filter((row) => /^[A-Z_]+=/.test(row))
    .map((row) => [row.slice(0, row.indexOf("=")), row.slice(row.indexOf("=") + 1)]),
);
const mask = {
  statics: { graph: "https://graph.facebook.com/v26.0", number: env.VIVA_WHATSAPP_NUMBER_ID },
  secrets: {
    app: env.SECRET_VIVA_WHATSAPP_APP,
    verify: env.SECRET_VIVA_WHATSAPP_VERIFY,
    token: env.SECRET_VIVA_WHATSAPP_TOKEN,
  },
};

const gate = (ctx, next) => {
  if (!ctx.user) throw new Error("401");
  return next();
};
const service = { aperture: new Vector().use(shard.context.bind("mask", mask)).graft(aperture) };
const runtime = new Vector().use(gate);
runtime.branch("/service/whatsapp", service.aperture);

const tunnel = await fetch("http://127.0.0.1:20299/quicktunnel").then((response) =>
  response.json(),
);
const hook = `https://${tunnel.hostname}/attached/process/service/service/whatsapp/webhook`;
const asked = (nature, ctx) =>
  Promise.resolve()
    .then(() => steer.dispatch.execute(runtime, ctx, `/service/whatsapp${nature}`))
    .then(() => ctx.output)
    .catch((fault) => fault.message);

console.log("bare /state", await asked("/state", { input: {} }));
console.log("/state", await asked("/state", { user: "beef", input: {} }));
const { data } = await asked("/token", { user: "beef", input: {} });
console.log("/token", { is_valid: data.is_valid, expires_at: data.expires_at, type: data.type });
console.log("/claim", await asked("/claim", { user: "beef", input: { hook } }));
