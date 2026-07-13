// Harvest Castilian word audio from Wikimedia Commons / Lingua Libre.
// Per target surface form: search -> filter LL-Q1321 (spa)-<speaker>-<word> ->
// resolve url -> download -> ffmpeg normalize -> candidates/<form>/<speaker>.mp3.
const DIR = new URL("..", import.meta.url).pathname;
const OUT = `${DIR}.harvest/candidates`;
const UA = "vivalence-harvester/0.1";
const MAX_PER_WORD = 6;

const forms: { slug: string; form: string; en: string }[] =
  JSON.parse(await Deno.readTextFile(`${DIR}.harvest/forms.json`));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const slugSpeaker = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "anon";

async function api(params: Record<string, string>, tries = 4): Promise<any> {
  const qs = new URLSearchParams({ format: "json", ...params }).toString();
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(`https://commons.wikimedia.org/w/api.php?${qs}`, { headers: { "User-Agent": UA } });
      const txt = await r.text();
      if (txt[0] !== "{") { await sleep(1500); continue; }
      return JSON.parse(txt);
    } catch { await sleep(1500); }
  }
  return null;
}

async function candidatesFor(form: string): Promise<{ speaker: string; title: string }[]> {
  const j = await api({ action: "query", list: "search", srnamespace: "6", srlimit: "50", srsearch: `intitle:${form} intitle:spa` });
  const titles: string[] = (j?.query?.search ?? []).map((s: any) => s.title);
  const esc = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(`\\(spa\\)-(.+?)-${esc}\\.(wav|ogg|oga|flac|mp3)$`, "i");
  const out: { speaker: string; title: string }[] = [];
  const seen = new Set<string>();
  for (const t of titles) {
    const m = t.match(rx);
    if (!m) continue;
    const sp = slugSpeaker(m[1]);
    if (seen.has(sp)) continue;
    seen.add(sp);
    out.push({ speaker: sp, title: t });
    if (out.length >= MAX_PER_WORD) break;
  }
  // second source: Wikimedia "Es-<word>.ogg" pronunciation files (non-existent ones drop out at resolve)
  const cap = form.charAt(0).toUpperCase() + form.slice(1);
  out.push({ speaker: "wiktionary", title: `File:Es-${form}.ogg` });
  out.push({ speaker: "wiktionary-oga", title: `File:Es-${form}.oga` });
  out.push({ speaker: "wiktionary-cap", title: `File:Es-${cap}.ogg` });
  return out;
}

async function resolveUrls(titles: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const j = await api({ action: "query", prop: "imageinfo", iiprop: "url", titles: chunk.join("|") });
    for (const p of Object.values<any>(j?.query?.pages ?? {})) {
      if (p.title && p.imageinfo?.[0]?.url) map[p.title] = p.imageinfo[0].url;
    }
    await sleep(200);
  }
  return map;
}

async function download(url: string, dest: string, tries = 5): Promise<boolean> {
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) { await sleep(1000 * 2 ** t); continue; }
      const b = new Uint8Array(await r.arrayBuffer());
      if (b.byteLength < 500) { await sleep(1000 * 2 ** t); continue; }
      await Deno.writeFile(dest, b);
      return true;
    } catch { await sleep(1000 * 2 ** t); }
  }
  return false;
}

async function mp3Count(form: string): Promise<number> {
  let n = 0;
  try {
    for await (const e of Deno.readDir(`${OUT}/${form}`)) if (e.name.endsWith(".mp3")) n++;
  } catch { /* no dir */ }
  return n;
}

async function normalize(src: string, dest: string): Promise<boolean> {
  const cmd = new Deno.Command("ffmpeg", {
    args: ["-y", "-loglevel", "error", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
      "-c:a", "libmp3lame", "-b:a", "96k", "-ar", "22050", "-ac", "1", dest],
    stderr: "piped", stdout: "null",
  });
  return (await cmd.output()).code === 0;
}

async function main() {
  await Deno.mkdir(OUT, { recursive: true });
  const tmp = await Deno.makeTempDir({ prefix: "commons-spa-" });
  let manifest: Record<string, { speaker: string; source: string }[]> = {};
  try { manifest = JSON.parse(await Deno.readTextFile(`${DIR}.harvest/word-candidates.json`)); } catch { /* fresh */ }
  const zero: string[] = [];
  let words = 0, files = 0;

  for (const { form } of forms) {
    if (await mp3Count(form) >= 2) { words++; continue; }
    const cands = await candidatesFor(form);
    if (!cands.length) { zero.push(form); console.log(`ZERO ${form}`); await sleep(250); continue; }
    const urls = await resolveUrls(cands.map((c) => c.title));
    const wordDir = `${OUT}/${form}`;
    await Deno.mkdir(wordDir, { recursive: true });
    const landed: { speaker: string; source: string }[] = [];
    for (const c of cands) {
      const url = urls[c.title];
      if (!url) continue;
      const ext = url.split(".").pop()!.toLowerCase();
      const raw = `${tmp}/${form}-${c.speaker}.${ext}`;
      const finalPath = `${wordDir}/${c.speaker}.mp3`;
      try { await Deno.stat(finalPath); landed.push({ speaker: c.speaker, source: c.title }); continue; } catch { /* not yet */ }
      if (!(await download(url, raw))) continue;
      if (!(await normalize(raw, finalPath))) continue;
      try { await Deno.remove(raw); } catch { /* ignore */ }
      landed.push({ speaker: c.speaker, source: c.title });
      files++;
    }
    if (landed.length) { manifest[form] = landed; words++; console.log(`ok ${form.padEnd(12)} ${landed.length} [${landed.map((l) => l.speaker).join(", ")}]`); }
    else { zero.push(form); console.log(`ZERO ${form} (dl/ffmpeg failed)`); }
    await sleep(600);
  }

  await Deno.writeTextFile(`${DIR}.harvest/word-candidates.json`, JSON.stringify(manifest, null, 2));
  await Deno.writeTextFile(`${DIR}.harvest/word-gaps.json`, JSON.stringify(zero, null, 2));
  try { await Deno.remove(tmp, { recursive: true }); } catch { /* ignore */ }
  console.log(`\nDONE words=${words}/${forms.length} files=${files} gaps=${zero.length}`);
  console.log(`GAPS: ${zero.join(", ")}`);
}

main();
