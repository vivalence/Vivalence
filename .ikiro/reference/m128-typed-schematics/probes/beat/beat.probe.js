const root = new URL("../", import.meta.url);
const uri = (name) => new URL(name, root).href;
const text = (name) => Deno.readTextFileSync(new URL(name, root));

const LANGUAGES = { js: "javascript", ts: "typescript" };
const ASKED = ["beat/today.js", "beat/twin.js", "beat/vector.js", "beat/call.js", "beat/jsdoc.js", "beat/annotated.ts"];

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
  const before = source.slice(0, source.indexOf(marker) + shift).split("\n");
  return { line: before.length - 1, character: before.at(-1).length };
};

const QUESTIONS = [
  ["HOVER die", "textDocument/hover", "die.aperture", 1],
  ["COMPLETION die.", "textDocument/completion", "die.aperture", 4],
  ["HOVER die.controller.status", "textDocument/hover", "die.controller.status", "die.controller.st".length],
  ["HOVER die.mask.mountpoint", "textDocument/hover", "die.mask.mountpoint", "die.mask.mo".length],
];

await send({
  id: 1,
  method: "initialize",
  params: {
    processId: Deno.pid,
    rootUri: root.href,
    workspaceFolders: [{ uri: root.href, name: "scratch" }],
    capabilities: { textDocument: { completion: {}, publishDiagnostics: {} } },
    initializationOptions: { enable: true, lint: false, config: "./deno.json" },
  },
});

const deadline = setTimeout(() => {
  console.log("TIMEOUT 90s");
  child.kill("SIGTERM");
}, 90000);

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
    const name = `beat/${message.params.uri.split("/").at(-1)}`;
    published.add(name);
    if (!asked && ASKED.every((opened) => published.has(opened))) {
      asked = true;
      for (const name of ASKED) {
        for (const [label, method, marker, shift] of QUESTIONS) {
          pending.set(next, `${name} · ${label}`);
          await send({
            id: next++,
            method,
            params: { textDocument: { uri: uri(name) }, position: at(name, marker, shift) },
          });
        }
      }
    }
  }
  if (pending.has(message.id)) {
    const label = pending.get(message.id);
    pending.delete(message.id);
    if (label.includes("HOVER")) console.log(label, "→", JSON.stringify(message.result?.contents ?? message.error ?? null));
    else {
      const items = message.result?.items ?? message.result ?? [];
      console.log(label, "→", items.map((item) => item.label).join(" "));
    }
  }
  if (asked && pending.size === 0) break;
}

clearTimeout(deadline);
child.kill("SIGTERM");
await child.status;
