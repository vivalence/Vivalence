// Source + download + normalize 100-sentence expansion from Tatoeba (server-side).
// Reads sent-targets.json, writes freight mp3s + sent-sources.json for the place step.
const DIR = new URL(".", import.meta.url).pathname;
const OUT = `${DIR}../freight/audio/sentences`;
const UA = "vivalence-harvester/0.1";

const targets = JSON.parse(await Deno.readTextFile(`${DIR}sent-targets.json`)) as { slug: string; text: string; en: string }[];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,]/g, "").trim().toLowerCase();

async function search(text: string, tries = 3): Promise<any[]> {
  const url = `https://tatoeba.org/en/api_v0/search?from=spa&has_audio=yes&query=${encodeURIComponent(text)}`;
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      const txt = await r.text();
      if (txt[0] !== "{") { await sleep(1500); continue; }
      return (JSON.parse(txt).results || []).filter((x: any) => (x.audios || []).length);
    } catch { await sleep(1500); }
  }
  return [];
}
async function download(id: number, dest: string): Promise<boolean> {
  try {
    const r = await fetch(`https://tatoeba.org/audio/download/${id}`, { headers: { "User-Agent": UA } });
    if (!r.ok) return false;
    const b = new Uint8Array(await r.arrayBuffer());
    if (b.byteLength < 1000) return false;
    await Deno.writeFile(dest, b);
    return true;
  } catch { return false; }
}
async function normalize(src: string, dest: string): Promise<boolean> {
  const cmd = new Deno.Command("ffmpeg", { args: ["-y", "-loglevel", "error", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "libmp3lame", "-b:a", "96k", "-ar", "22050", "-ac", "1", dest], stderr: "piped", stdout: "null" });
  return (await cmd.output()).code === 0;
}

await Deno.mkdir(OUT, { recursive: true });
const tmp = await Deno.makeTempDir({ prefix: "tato100-" });
const sources: Record<string, { matchText: string; sid: number; audio_id: number; exact: boolean; en: string }> = {};
let ok = 0, none = 0, fail = 0;

for (const { slug, text, en } of targets) {
  const q = norm(text);
  const res = await search(text);
  const best = res.find((r) => norm(r.text) === q) || res[0];
  if (!best) { none++; console.log(`NONE  ${slug}`); await sleep(300); continue; }
  const audio_id = best.audios[0].id;
  const raw = `${tmp}/${audio_id}.mp3`;
  const final = `${OUT}/${slug}.mp3`;
  if (!(await download(audio_id, raw)) || !(await normalize(raw, final))) { fail++; console.log(`FAIL  ${slug} aid=${audio_id}`); await sleep(300); continue; }
  try { await Deno.remove(raw); } catch { /* */ }
  const exact = norm(best.text) === q;
  sources[slug] = { matchText: best.text, sid: best.id, audio_id, exact, en };
  ok++;
  console.log(`ok ${exact ? "=" : "~"} ${slug.padEnd(30)} ${best.text}`);
  await sleep(300);
}
await Deno.writeTextFile(`${DIR}sent-sources.json`, JSON.stringify(sources, null, 2));
try { await Deno.remove(tmp, { recursive: true }); } catch { /* */ }
console.log(`\nDONE ok=${ok} (exact=${Object.values(sources).filter((s) => s.exact).length} inverted=${Object.values(sources).filter((s) => !s.exact).length}) none=${none} fail=${fail}`);
