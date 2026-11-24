import { shape, Vector } from "@vivalence/typology";

const hex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const signed = async (secret, bytes) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return `sha256=${hex(await crypto.subtle.sign("HMAC", key, bytes))}`;
};

const body = '{"entry":[{"id":"1"}],  "text":"caf\\u00e9 é"}';
const bytes = new TextEncoder().encode(body);
const claimed = await signed("app-secret", bytes);

const hook = new Vector().open("/webhook", async (ctx) => ({
  used: ctx.request.raw.bodyUsed,
  raw: await ctx.request.raw.arrayBuffer().then((buffer) => buffer.byteLength, (error) => error.message),
  restringified: (await signed("app-secret", new TextEncoder().encode(JSON.stringify(ctx.request.body)))) === claimed,
}));

const response = await shape.http(hook)(
  new Request("http://localhost/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-hub-signature-256": claimed },
    body: bytes,
  }),
);
console.log(JSON.stringify({ status: response.status, sent: bytes.byteLength, handler: await response.json() }));
