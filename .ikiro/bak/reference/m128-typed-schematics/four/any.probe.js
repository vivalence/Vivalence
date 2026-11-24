const [config, base, ...names] = Deno.args;
const root = new URL(base.endsWith("/") ? base : `${base}/`, `file://${Deno.cwd()}/`);
const uri = (name) => new URL(name, root).href;
const text = (name) => Deno.readTextFileSync(new URL(name, root));

const LANGUAGES = { js: "javascript", ts: "typescript" };
const NAME = /[A-Za-z_$][\w$]*/g;

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
    const grown = new Uint8Array(held.length + chunk.length);
    grown.set(held);
    grown.set(chunk, held.length);
    held = grown;
    while (true) {
      const head = decoder.decode(held.slice(0, 64));
      const length = /Content-Length: (\d+)\r\n\r\n/.exec(head);
      if (!length) break;
      const start = head.indexOf("\r\n\r\n") + 4;
      if (held.length < start + Number(length[1])) break;
      yield JSON.parse(decoder.decode(held.slice(start, start + Number(length[1]))));
      held = held.slice(start + Number(length[1]));
    }
  }
}

const occurrences = (name) =>
  text(name)
    .split("\n")
    .flatMap((row, line) => [...row.matchAll(NAME)].map((match) => ({ name, word: match[0], line, character: match.index })));

await send({
  id: 1,
  method: "initialize",
  params: {
    processId: Deno.pid,
    rootUri: root.href,
    workspaceFolders: [{ uri: root.href, name: "scratch" }],
    capabilities: { textDocument: { publishDiagnostics: {} } },
    initializationOptions: { enable: true, lint: false, config },
  },
});

const deadline = setTimeout(() => {
  console.log("TIMEOUT 240s");
  child.kill("SIGTERM");
}, 240000);

const published = new Set();
const pending = new Map();
const answered = [];
let asked = false;
let next = 10;

for await (const message of messages()) {
  if (message.id === 1 && message.result) {
    await send({ method: "initialized", params: {} });
    for (const name of names) {
      await send({
        method: "textDocument/didOpen",
        params: { textDocument: { uri: uri(name), languageId: LANGUAGES[name.split(".").at(-1)], version: 1, text: text(name) } },
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
    if (!asked && names.every((name) => published.has(uri(name)))) {
      asked = true;
      for (const name of names) {
        for (const occurrence of occurrences(name)) {
          pending.set(next, occurrence);
          await send({
            id: next++,
            method: "textDocument/hover",
            params: { textDocument: { uri: uri(name) }, position: { line: occurrence.line, character: occurrence.character } },
          });
        }
      }
    }
  }
  if (pending.has(message.id)) {
    const occurrence = pending.get(message.id);
    pending.delete(message.id);
    const contents = message.result?.contents;
    const shown = Array.isArray(contents) ? contents.map((part) => part.value ?? part).join("\n") : (contents?.value ?? null);
    answered.push({ ...occurrence, shown });
  }
  if (asked && pending.size === 0) break;
}

clearTimeout(deadline);
child.kill("SIGTERM");
await child.status;

const signature = (shown) => /```\w*\n([\s\S]*?)\n```/.exec(shown)?.[1] ?? shown;
const ANY = /^(?:\(([\w ]+)\) )?(?:(const|let|var) )?[\w$.]+\??: any$/;

for (const name of names) {
  const symbols = answered.filter((entry) => entry.name === name && entry.shown).map((entry) => ({ ...entry, signature: signature(entry.shown) }));
  const any = symbols.filter((entry) => ANY.test(entry.signature));
  const first = new Map();
  for (const entry of any.toSorted((a, b) => a.line - b.line || a.character - b.character)) {
    if (!first.has(entry.signature)) first.set(entry.signature, { row: entry.line + 1, uses: 0 });
    first.get(entry.signature).uses++;
  }
  console.log(`== ${name}`);
  const under = symbols.filter((entry) => entry.signature === "any");
  console.log(`names hovered ${symbols.length} · any ${any.length} · distinct any ${first.size} · a member of an any ${under.length}`);
  for (const [shown, { row, uses }] of first) console.log(`  ${String(row).padStart(3)}  ×${String(uses).padEnd(3)} ${shown}`);
  if (under.length <= 20) for (const entry of under) console.log(`  ${String(entry.line + 1).padStart(3)}  member ${entry.word}`);
}
