const root = new URL(".", import.meta.url);
const uri = (name) => new URL(name, root).href;
const text = (name) => Deno.readTextFileSync(new URL(name, root));

const LANGUAGES = { js: "javascript", ts: "typescript" };
const OPENED = ["typed.ts", "whole.js", "complete.js", "complete.ts", "caller.js"];
const ASKED = ["whole.js", "complete.js", "complete.ts"];

const child = new Deno.Command("deno", {
  args: ["lsp"],
  cwd: root.pathname,
  stdin: "piped",
  stdout: "piped",
  stderr: "inherit",
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

const after = (name) => {
  const source = text(name);
  const offset = source.indexOf("ctx.input.") + "ctx.input.".length;
  const before = source.slice(0, offset).split("\n");
  return { line: before.length - 1, character: before.at(-1).length };
};

const open = (name) =>
  send({
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

await send({
  id: 1,
  method: "initialize",
  params: {
    processId: Deno.pid,
    rootUri: root.href,
    workspaceFolders: [{ uri: root.href, name: "scratch" }],
    capabilities: { textDocument: { completion: {}, publishDiagnostics: {} } },
    initializationOptions: { enable: true, lint: true, config: "./deno.json" },
  },
});

const deadline = setTimeout(() => {
  console.log("TIMEOUT 45s");
  child.kill("SIGTERM");
}, 45000);

const published = new Set();
const pending = new Map();
let asked = false;
let linted = false;
let next = 10;

for await (const message of messages()) {
  if (message.id === 1 && message.result) {
    await send({ method: "initialized", params: {} });
    for (const name of OPENED) await open(name);
    continue;
  }
  if (message.id !== undefined && message.method) {
    await send({ id: message.id, result: null });
    continue;
  }
  if (message.method === "textDocument/publishDiagnostics") {
    const name = message.params.uri.split("/").at(-1);
    published.add(name);
    console.log("PUBLISH", name, message.params.diagnostics.length);
    for (const diagnostic of message.params.diagnostics) {
      const row = [diagnostic.source, diagnostic.code, diagnostic.range.start.line + 1, diagnostic.message.split("\n")[0]];
      console.log("  ", row.join(" · "));
      if (diagnostic.source === "deno-lint") linted = true;
    }
    if (!asked && OPENED.every((opened) => published.has(opened))) {
      asked = true;
      for (const asking of ASKED) {
        const position = after(asking);
        pending.set(next, `COMPLETION ${asking}`);
        await send({
          id: next++,
          method: "textDocument/completion",
          params: { textDocument: { uri: uri(asking) }, position },
        });
        pending.set(next, `HOVER ${asking}`);
        await send({
          id: next++,
          method: "textDocument/hover",
          params: {
            textDocument: { uri: uri(asking) },
            position: { line: position.line, character: position.character - 3 },
          },
        });
      }
    }
  }
  if (pending.has(message.id)) {
    const label = pending.get(message.id);
    pending.delete(message.id);
    if (label.startsWith("HOVER")) console.log(label, JSON.stringify(message.result?.contents ?? message.error ?? null));
    else {
      const items = message.result?.items ?? message.result ?? [];
      console.log(label, items.map((item) => `${item.label}:${item.kind}`).join(" "));
    }
  }
  if (asked && pending.size === 0 && linted) break;
}

clearTimeout(deadline);
child.kill("SIGTERM");
await child.status;
