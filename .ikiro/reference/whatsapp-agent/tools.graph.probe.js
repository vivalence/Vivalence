import { steer, v, Vector } from "@vivalence/typology";
import { meta } from "../../../commons/social/whatsapp/graph.js";

export const tools = new Vector()
  .open(
    {
      nature: "/state",
      valence:
        "How Meta sees this number: whether it can send, and which webhook Meta delivers to. " +
        'Example: {} → { status: "CONNECTED", webhook_configuration: { application: "https://…" } }',
    },
    async (ctx) => ({ condition: "OK", output: await ctx.service.state() }),
  )
  .open(
    {
      nature: "/token",
      valence:
        "Whether the Graph token is valid and how many minutes it has left; a token that " +
        "never expires answers null. Example: {} → { valid: true, minutes: 87 }",
    },
    async (ctx) => ({ condition: "OK", output: await ctx.service.token() }),
  )
  .open(
    {
      nature: "/claim",
      valence:
        "Point Meta's deliveries for this number at a webhook of ours. Meta calls it at once, " +
        "so it must already answer. The app's own callback is left alone. " +
        'Example: { hook: "https://x.trycloudflare.com/attached/process/service/service/whatsapp/webhook" }',
      input: v.object({
        hook: v
          .string()
          .desc("the public URL of this instance's webhook")
          .example("https://x.trycloudflare.com/attached/process/service/service/whatsapp/webhook"),
      }),
    },
    async (ctx) => ({ condition: "OK", output: await ctx.service.claim(ctx.input.hook) }),
  );

const env = Object.fromEntries(
  Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/instances/localhost/.env`)
    .split("\n")
    .filter((row) => /^[A-Z_]+=/.test(row))
    .map((row) => [row.slice(0, row.indexOf("=")), row.slice(row.indexOf("=") + 1)]),
);
const mask = {
  statics: { graph: "https://graph.facebook.com/v26.0", number: env.VIVA_WHATSAPP_NUMBER_ID },
  secrets: { token: env.SECRET_VIVA_WHATSAPP_TOKEN, verify: env.SECRET_VIVA_WHATSAPP_VERIFY },
};
const whatsapp = meta(mask);
const service = {
  state: whatsapp.state,
  token: async () => {
    const { data } = await whatsapp.token();
    return {
      valid: data.is_valid,
      minutes: data.expires_at ? Math.round((data.expires_at * 1000 - Date.now()) / 60000) : null,
    };
  },
  claim: (hook) => whatsapp.claim(hook, mask.secrets.verify),
};
const tunnel = await fetch("http://127.0.0.1:20299/quicktunnel").then((response) => response.json());
const hook = `https://${tunnel.hostname}/attached/process/service/service/whatsapp/webhook`;

for (const [nature, input] of [["/state"], ["/token"], ["/claim", { hook }]])
  console.log(nature, await steer.dispatch.execute(tools, { service, input }, nature));
