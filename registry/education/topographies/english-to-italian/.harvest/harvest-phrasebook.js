const TOPOGRAPHY = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const HARVEST = `${TOPOGRAPHY}/.harvest`;
const FREIGHT = `${TOPOGRAPHY}/freight/audio/sentences`;
const STATE = `${HARVEST}/harvest-phrasebook-state.json`;
const CACHE = "/tmp/tatoeba";
const EXPORTS = "https://downloads.tatoeba.org/exports";
const OK_LICENSES = /^(CC0|CC BY(?!-))/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readJson = async (path, fallback) =>
  await Deno.readTextFile(path).then(JSON.parse).catch(() => fallback);

const cached = async (name, url, unpack) => {
  const file = `${CACHE}/${name}`;
  const held = await Deno.stat(file).catch(() => null);
  if (!held) {
    await Deno.mkdir(CACHE, { recursive: true });
    const res = await fetch(url, { headers: { "User-Agent": "vivalence-harvester/0.3" } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const packed = `${file}.${unpack === "tar" ? "tar.bz2" : "bz2"}`;
    await Deno.writeFile(packed, new Uint8Array(await res.arrayBuffer()));
    const command = unpack === "tar"
      ? new Deno.Command("tar", { args: ["xjf", packed, "-C", CACHE] })
      : new Deno.Command("bunzip2", { args: ["-f", packed] });
    const out = await command.output();
    if (!out.success) throw new Error(`unpack failed for ${packed}`);
  }
  return await Deno.readTextFile(file);
};

const download = async (audioId, dest) => {
  const res = await fetch(`https://tatoeba.org/audio/download/${audioId}`, {
    headers: { "User-Agent": "vivalence-harvester/0.3" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const raw = `${dest}.raw`;
  await Deno.writeFile(raw, new Uint8Array(await res.arrayBuffer()));
  const norm = await new Deno.Command("ffmpeg", {
    args: ["-y", "-i", raw, "-af", "loudnorm=I=-18:TP=-2:LRA=11", "-ar", "44100", "-b:a", "128k", dest],
  }).output();
  await Deno.remove(raw);
  const size = await Deno.stat(dest).then((s) => s.size).catch(() => 0);
  if (!norm.success || size < 4000) {
    await Deno.remove(dest).catch(() => {});
    return false;
  }
  return true;
};

const inject = async (state) => {
  const fpath = `${TOPOGRAPHY}/dataset/literals/sentences.js`;
  const entities = JSON.parse((await Deno.readTextFile(fpath)).replace("export default ", ""));
  const patched = entities.map((e) => {
    const hit = state.done[e.slug];
    if (!hit || e.traits.includes("VOCALIZED")) return e;
    return {
      ...e,
      traits: [...e.traits, "VOCALIZED"],
      trait: { ...e.trait, VOCALIZED: { asset: { path: `sentences/${e.slug}.mp3` } } },
    };
  });
  await Deno.writeTextFile(fpath, "export default " + JSON.stringify(patched, null, 2) + "\n");
};

const targets = await readJson(`${HARVEST}/harvest-targets.json`, []);
const texts = new Map(targets.map((t) => [t.text.trim(), t]));
const state = await readJson(STATE, { done: {}, misses: [], failed: [] });
await Deno.mkdir(FREIGHT, { recursive: true });

const sentences = await cached(
  "ita_sentences.tsv",
  `${EXPORTS}/per_language/ita/ita_sentences.tsv.bz2`,
);
const bySid = new Map();
for (const line of sentences.split("\n")) {
  const [sid, , text] = line.split("\t");
  if (text && texts.has(text.trim())) bySid.set(sid, texts.get(text.trim()));
}

const audio = await cached(
  "sentences_with_audio.csv",
  `${EXPORTS}/sentences_with_audio.tar.bz2`,
  "tar",
);
const found = new Map();
for (const line of audio.split("\n")) {
  const [sid, audioId, author, license] = line.split("\t");
  const target = bySid.get(sid);
  if (!target || found.has(target.slug)) continue;
  if (license && !OK_LICENSES.test(license)) continue;
  found.set(target.slug, { sid: Number(sid), audio: Number(audioId), author, license: license || "Tatoeba terms" });
}

state.misses = targets.map((t) => t.slug).filter((slug) => !found.has(slug) && !state.done[slug]);
const pending = [...found].filter(([slug]) => !state.done[slug] && !state.failed.includes(slug));
console.log(`targets ${targets.length}, in corpus ${bySid.size}, licensed audio ${found.size}, pending ${pending.length}`);

for (const [slug, hit] of pending) {
  if (await download(hit.audio, `${FREIGHT}/${slug}.mp3`)) {
    state.done[slug] = hit;
  } else {
    state.failed.push(slug);
  }
  await Deno.writeTextFile(STATE, JSON.stringify(state, null, 1));
  await sleep(2000);
}

await inject(state);
const attribution = Object.entries(state.done).map(([slug, d]) =>
  `${slug}: tatoeba.org sentence ${d.sid}, audio by ${d.author} (${d.license})`
);
await Deno.writeTextFile(`${HARVEST}/phrasebook-attribution.txt`, attribution.join("\n") + "\n");
console.log(`done: ${Object.keys(state.done).length} hits, ${state.misses.length} no-audio, ${state.failed.length} failed`);
