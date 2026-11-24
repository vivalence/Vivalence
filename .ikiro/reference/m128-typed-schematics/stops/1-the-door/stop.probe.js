const root = new URL("../", import.meta.url);
const uri = (name) => new URL(name, root).href;
const text = (name) => Deno.readTextFileSync(new URL(name, root));

const LANGUAGES = { js: "javascript", ts: "typescript" };
const HOVER = "textDocument/hover";
const COMPLETION = "textDocument/completion";

const DOOR = [
  [`${Deno.args[1]}/typology/schematics/primitives/manifest.js`, "HOVER Manifest", HOVER, "export const Manifest", "export const Mani".length],
  ["stop1/ledger.js", "HOVER faults", HOVER, "const faults = v.primitives.Manifest", "const fau".length],
  ["stop1/ledger.js", "HOVER .faults(", HOVER, "v.primitives.Manifest.faults(", "v.primitives.Manifest.fau".length],
  ["stop1/ledger.js", "HOVER fault", HOVER, "${fault.at}", "${fa".length],
  ["stop1/ledger.js", "COMPLETION fault.", COMPLETION, "${fault.at}", "${fault.".length],
  ["stop1/registry.js", "HOVER .cast(", HOVER, "v.primitives.Manifest.cast(", "v.primitives.Manifest.ca".length],
];

const SCALARS = [
  [`${Deno.args[1]}/typology/schematics/primitives/manifest.js`, "HOVER Manifest", HOVER, "export const Manifest", "export const Mani".length],
  [`${Deno.args[1]}/typology/schematics/primitives/instance.js`, "HOVER RuntimeMask", HOVER, "export const RuntimeMask", "export const Runt".length],
  [`${Deno.args[1]}/typology/schematics/primitives/instance.js`, "HOVER Mountpoint", HOVER, "export const Mountpoint", "export const Moun".length],
  ["stop1/registry.js", "HOVER .cast(", HOVER, "v.primitives.Manifest.cast(", "v.primitives.Manifest.ca".length],
];

const QUESTIONS = { door: DOOR, scalars: SCALARS }[Deno.args[2] ?? "door"];

const ASKED = [...new Set(QUESTIONS.map(([name]) => name))];

const child = new Deno.Command("deno", {
  args: ["lsp"],
  cwd: root.pathname,
  stdin: "piped",
  stdout: "piped",
  stderr: "null",
}).spawn();

const writer = child.stdin.getWriter();
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const send = (message) => {
  const body = encoder.encode(JSON.stringify({ jsonrpc: "2.0", ...message }));
  const head = encoder.encode(`Content-Length: ${body.length}\r\n\r\n`);
  return writer.write(new Uint8Array([...head, ...body]));
};

async function* messages() {
  let held = new Uint8Array(0);
  for await (const chunk of child.stdout) {
    held = new Uint8Array([...held, ...chunk]);
    while (true) {
      const split = decoder.decode(held).indexOf("\r\n\r\n");
      if (split < 0) break;
      const length = Number(/Content-Length: (\d+)/.exec(decoder.decode(held.slice(0, split)))[1]);
      if (held.length < split + 4 + length) break;
      yield JSON.parse(decoder.decode(held.slice(split + 4, split + 4 + length)));
      held = held.slice(split + 4 + length);
    }
  }
}

const at = (name, marker, shift) => {
  const source = text(name);
  if (!source.includes(marker)) throw new Error(`${name}: no "${marker}"`);
  const before = source.slice(0, source.indexOf(marker) + shift).split("\n");
  return { line: before.length - 1, character: before.at(-1).length };
};

await send({
  id: 1,
  method: "initialize",
  params: {
    processId: Deno.pid,
    rootUri: root.href,
    workspaceFolders: [{ uri: root.href, name: "scratch" }],
    capabilities: { textDocument: { completion: {}, publishDiagnostics: {} } },
    initializationOptions: { enable: true, lint: false, config: Deno.args[0] },
  },
});

const deadline = setTimeout(() => {
  console.log("TIMEOUT 120s");
  child.kill("SIGTERM");
}, 120000);

const published = new Set();
const pending = new Map();
let asked = false;
let next = 10;

for await (const message of messages()) {
  if (message.id === 1 && message.result) {
    await send({ method: "initialized", params: {} });
    for (const name of ASKED) {
      await send({
        method: "textDocument/didOpen",
        params: {
          textDocument: {
            uri: uri(name),
            languageId: LANGUAGES[name.split(".").at(-1)],
            version: 1,
            text: text(name),
          },
        },
      });
    }
    continue;
  }
  if (message.id !== undefined && message.method) {
    await send({ id: message.id, result: null });
    continue;
  }
  if (message.method === "textDocument/publishDiagnostics") {
    published.add(message.params.uri);
    if (!asked && ASKED.every((name) => published.has(uri(name)))) {
      asked = true;
      for (const [name, label, method, marker, shift] of QUESTIONS) {
        const position = at(name, marker, shift);
        pending.set(next, `${name}:${position.line + 1} · ${label}`);
        await send({ id: next++, method, params: { textDocument: { uri: uri(name) }, position } });
      }
    }
  }
  if (pending.has(message.id)) {
    const label = pending.get(message.id);
    pending.delete(message.id);
    if (label.includes("HOVER")) console.log(`${label}\n${message.result?.contents?.value ?? JSON.stringify(message.error ?? null)}`);
    else {
      const items = message.result?.items ?? message.result ?? [];
      console.log(`${label}\n${items.map((item) => item.label).join(" ")}\n`);
    }
  }
  if (asked && pending.size === 0) break;
}

clearTimeout(deadline);
child.kill("SIGTERM");
await child.status;
