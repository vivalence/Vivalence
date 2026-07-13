const SOURCES = "../.harvest/sources.json";
const OUT = "../freight/audio/sentences";

type Sentence = {
  slug: string;
  text: string | null;
  audio_id: number | null;
  author: string | null;
  match: string;
  download: string | null;
};

async function fetchAudio(url: string, dest: string): Promise<{ ok: boolean; reason?: string }> {
  const res = await fetch(url, { headers: { "User-Agent": "vivalence-harvester/0.1" } });
  if (!res.ok) return { ok: false, reason: `http_${res.status}` };
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength < 1000) return { ok: false, reason: `too_small_${buf.byteLength}` };
  await Deno.writeFile(dest, buf);
  return { ok: true };
}

async function normalize(src: string, dest: string): Promise<{ ok: boolean; reason?: string }> {
  const cmd = new Deno.Command("ffmpeg", {
    args: [
      "-y", "-loglevel", "error",
      "-i", src,
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
      "-c:a", "libmp3lame", "-b:a", "96k",
      "-ar", "22050", "-ac", "1",
      dest,
    ],
    stderr: "piped", stdout: "null",
  });
  const out = await cmd.output();
  if (out.code !== 0) {
    const err = new TextDecoder().decode(out.stderr).slice(0, 200);
    return { ok: false, reason: `ffmpeg_${out.code}_${err}` };
  }
  return { ok: true };
}

async function main() {
  await Deno.mkdir(OUT, { recursive: true });
  const { sentences } = JSON.parse(await Deno.readTextFile(SOURCES)) as { sentences: Sentence[] };
  const tmpDir = await Deno.makeTempDir({ prefix: "tatoeba-spa-" });

  let ok = 0, skip = 0, fail = 0;
  const landed: Record<string, { audio_id: number; author: string | null; text: string }> = {};

  for (const s of sentences) {
    if (!s.audio_id || !s.download) {
      console.log(`SKIP ${s.slug} :: ${s.match}`);
      skip++;
      continue;
    }
    const tmpPath = `${tmpDir}/${s.audio_id}.mp3`;
    const finalPath = `${OUT}/${s.slug}.mp3`;

    const fetched = await fetchAudio(s.download, tmpPath);
    if (!fetched.ok) {
      console.log(`FAIL fetch ${s.slug} aid=${s.audio_id} ${fetched.reason}`);
      fail++;
      continue;
    }
    const norm = await normalize(tmpPath, finalPath);
    if (!norm.ok) {
      console.log(`FAIL normalize ${s.slug} ${norm.reason}`);
      fail++;
      continue;
    }
    try { await Deno.remove(tmpPath); } catch { /* ignore */ }
    landed[s.slug] = { audio_id: s.audio_id, author: s.author, text: s.text! };
    ok++;
    console.log(`ok ${s.slug.padEnd(26)} aid=${s.audio_id} ${s.author ?? "?"} :: ${s.text}`);
  }

  await Deno.writeTextFile("../.harvest/landed-sentences.json", JSON.stringify(landed, null, 2));
  try { await Deno.remove(tmpDir, { recursive: true }); } catch { /* ignore */ }
  console.log(`\nDONE ok=${ok} skip=${skip} fail=${fail}`);
}

main();
