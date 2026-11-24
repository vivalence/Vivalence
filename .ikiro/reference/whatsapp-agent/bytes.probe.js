import { Context, Request } from "@vivalence/typology";

class Owned extends Request {
  bytes() {
    return (this.read ??= new Response(this.raw.body).arrayBuffer().then((buffer) => new Uint8Array(buffer)));
  }
}

const hex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const signed = async (secret, bytes) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return `sha256=${hex(await crypto.subtle.sign("HMAC", key, bytes))}`;
};

const arrive = async (req) => {
  const ctx = new Context({
    request: new Owned({ url: req.url, method: req.method, headers: Object.fromEntries(req.headers), raw: req }),
  });
  if (ctx.request.headers.get("content-type").includes("application/json"))
    ctx.input = JSON.parse(new TextDecoder().decode(await ctx.request.bytes()));
  return ctx;
};

const sent = new TextEncoder().encode('{"entry":[{"id":"1"}],  "text":"café"}');
const claimed = await signed("app-secret", sent);
const post = (type, body) => new globalThis.Request("http://localhost/webhook", { method: "POST", headers: { "content-type": type }, body });

const hook = await arrive(post("application/json", sent));
const file = await arrive(post("application/pdf", new Uint8Array([37, 80, 68, 70])));
const broken = await arrive(post("application/json", "{nope")).then(() => "silent", (error) => error.name);

console.log(JSON.stringify({
  input: hook.input,
  signature: (await signed("app-secret", await hook.request.bytes())) === claimed,
  once: (await hook.request.bytes()) === (await hook.request.bytes()),
  file: [...(await file.request.bytes())],
  fileInput: file.input ?? null,
  broken,
}));
