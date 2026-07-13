// Word-audio candidate picker — durable, corpus-agnostic, keyboard-first.
// Serves candidates/<form>/<speaker>.mp3, persists every pick atomically to
// .harvest/word-audio-picks.json (resume-safe). Reusable: drop both dotfiles
// into any corpus and run `deno run -A .word-picker-server.ts [--dir X] [--port N]`.
import { serveDir } from "jsr:@std/http/file-server";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { contentType } from "jsr:@std/media-types";
import { extname, join } from "jsr:@std/path";

const HERE = new URL(".", import.meta.url).pathname;
const args = parseArgs(Deno.args, { string: ["dir", "port"], default: { dir: HERE, port: "4747" } });
const CORPUS = args.dir;
const CAND = join(CORPUS, ".harvest/candidates");
const HARVEST = join(CORPUS, ".harvest");
const PICKS = join(HARVEST, "word-audio-picks.json");
const FORMS = join(HARVEST, "forms.json");
const PORT = Number(args.port);

type Picks = { picks: Record<string, string>; skipped: string[]; updated: number };

async function loadPicks(): Promise<Picks> {
  try { return JSON.parse(await Deno.readTextFile(PICKS)); }
  catch { return { picks: {}, skipped: [], updated: 0 }; }
}
async function savePicks(p: Picks) {
  p.updated = Object.keys(p.picks).length;
  const tmp = `${PICKS}.tmp`;
  await Deno.writeTextFile(tmp, JSON.stringify(p, null, 2));
  await Deno.rename(tmp, PICKS); // atomic
}

async function forms(): Promise<Record<string, { slug: string; en: string }>> {
  try {
    const arr = JSON.parse(await Deno.readTextFile(FORMS)) as { slug: string; form: string; en: string }[];
    return Object.fromEntries(arr.map((f) => [f.form, { slug: f.slug, en: f.en }]));
  } catch { return {}; }
}

async function scan(): Promise<{ form: string; candidates: string[] }[]> {
  const out: { form: string; candidates: string[] }[] = [];
  try {
    for await (const w of Deno.readDir(CAND)) {
      if (!w.isDirectory) continue;
      const cs: string[] = [];
      for await (const f of Deno.readDir(join(CAND, w.name))) if (f.name.endsWith(".mp3")) cs.push(f.name.replace(/\.mp3$/, ""));
      if (cs.length) out.push({ form: w.name, candidates: cs.sort() });
    }
  } catch { /* no candidates yet */ }
  out.sort((a, b) => a.form.localeCompare(b.form));
  return out;
}

async function state() {
  const [p, meta, words] = await Promise.all([loadPicks(), forms(), scan()]);
  return {
    port: PORT,
    words: words.map((w) => ({
      form: w.form,
      slug: meta[w.form]?.slug ?? null,
      gloss: meta[w.form]?.en ?? "",
      candidates: w.candidates,
      picked: p.picks[w.form] ?? null,
      skipped: p.skipped.includes(w.form),
    })),
    total: words.length,
    done: words.filter((w) => p.picks[w.form] || p.skipped.includes(w.form)).length,
  };
}

async function json(req: Request): Promise<any> { return await req.json().catch(() => ({})); }
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });

Deno.serve({ port: PORT, onListen: () => console.log(`\n  word-picker → http://localhost:${PORT}\n  corpus: ${CORPUS}\n`) }, async (req) => {
  const url = new URL(req.url);
  const path = decodeURIComponent(url.pathname);

  if (path === "/") return new Response(await Deno.readTextFile(join(HERE, ".word-picker.html")), { headers: { "content-type": "text/html" } });
  if (path === "/api/state") return J(await state());

  if (path === "/api/pick" && req.method === "POST") {
    const { form, speaker } = await json(req);
    const p = await loadPicks();
    p.picks[form] = speaker;
    p.skipped = p.skipped.filter((f) => f !== form);
    await savePicks(p);
    return J({ ok: true, done: Object.keys(p.picks).length });
  }
  if (path === "/api/unpick" && req.method === "POST") {
    const { form } = await json(req);
    const p = await loadPicks();
    delete p.picks[form];
    await savePicks(p);
    return J({ ok: true });
  }
  if (path === "/api/skip" && req.method === "POST") {
    const { form } = await json(req);
    const p = await loadPicks();
    if (!p.skipped.includes(form)) p.skipped.push(form);
    delete p.picks[form];
    await savePicks(p);
    return J({ ok: true });
  }

  if (path.startsWith("/audio/")) {
    const rel = path.slice("/audio/".length); // <form>/<speaker>.mp3
    try {
      const bytes = await Deno.readFile(join(CAND, rel));
      return new Response(bytes, { headers: { "content-type": contentType(extname(rel)) ?? "audio/mpeg" } });
    } catch { return new Response("not found", { status: 404 }); }
  }

  return serveDir(req, { fsRoot: HERE, quiet: true });
});
