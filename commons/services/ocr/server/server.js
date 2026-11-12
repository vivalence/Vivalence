import { decodeBase64 } from "jsr:@std/encoding@1.0.10/base64";

const PORT = Number(Deno.env.get("SERVICE_PORT"));
const KEY = Deno.env.get("SERVICE_KEY");
const HELD = Deno.env.get("TESSDATA_PREFIX");
const SHELF = Deno.env.get("TESSDATA_SHELF");

const FLAGS = { segmentation: "--psm", density: "--dpi" };
const CODE = /^[A-Za-z_]+$/;

const decoder = new TextDecoder();

class Refusal extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const trained = (code) => `${HELD}/${code}.traineddata`;

async function shelve(code) {
  if (!CODE.test(code)) throw new Refusal(422, `the engine holds no ${code}`);
  if (await Deno.stat(trained(code)).then(() => true, () => false)) return;
  const answered = await fetch(`${SHELF}/${code}.traineddata`);
  if (!answered.ok) throw new Refusal(422, `the engine holds no ${code} — ${SHELF} answers ${answered.status}`);
  await Deno.writeFile(`${trained(code)}.part`, answered.body);
  await Deno.rename(`${trained(code)}.part`, trained(code));
}

const shelving = new Map();

function shelved(code) {
  if (!shelving.has(code)) {
    const settled = shelve(code).finally(() => shelving.delete(code));
    shelving.set(code, settled);
  }
  return shelving.get(code);
}

async function read({ data, language, ...stated }) {
  await Promise.all(["osd", ...language.split("+")].map(shelved));
  const sheet = await Deno.makeTempFile({ prefix: "ocr-" });
  try {
    await Deno.writeFile(sheet, decodeBase64(data));
    const flags = Object.entries(FLAGS).flatMap(([name, flag]) => (name in stated ? [flag, String(stated[name])] : []));
    const args = [sheet, "-", "-l", language, ...flags, "-c", "tessedit_create_tsv=1"];
    const ended = await new Deno.Command("tesseract", { args, stdout: "piped", stderr: "piped" }).output();
    if (!ended.success) throw new Refusal(422, decoder.decode(ended.stderr).trim().split("\n")[0]);
    return { tsv: decoder.decode(ended.stdout) };
  } finally {
    await Deno.remove(sheet);
  }
}

async function status() {
  const held = [];
  for await (const entry of Deno.readDir(HELD)) {
    if (entry.name.endsWith(".traineddata")) held.push(entry.name.slice(0, -".traineddata".length));
  }
  return { status: "alive", languages: held.sort() };
}

const keyed = (request) => request.headers.get("authorization") === `Bearer ${KEY}`;

const ROUTES = [
  [(request, path) => request.method === "GET" && path === "/status", () => status()],
  [(request) => !keyed(request), () => Promise.reject(new Refusal(401, "the key does not match"))],
  [(request, path) => request.method === "POST" && path === "/read", async (request) => read(await request.json())],
  [() => true, () => Promise.reject(new Refusal(404, "no such route"))],
];

await Deno.mkdir(HELD, { recursive: true });

Deno.serve({ port: PORT, hostname: "0.0.0.0" }, async (request) => {
  const { pathname } = new URL(request.url);
  const [, answer] = ROUTES.find(([matches]) => matches(request, pathname));
  try {
    return Response.json(await answer(request));
  } catch (fault) {
    return Response.json({ message: fault.message }, { status: fault instanceof Refusal ? fault.status : 500 });
  }
});
