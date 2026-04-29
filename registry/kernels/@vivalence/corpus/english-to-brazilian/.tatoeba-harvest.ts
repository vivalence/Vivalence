import { parseArgs } from "jsr:@std/cli/parse-args";

const args = parseArgs(Deno.args, {
  string: ["input", "out", "state", "quota", "rate"],
  boolean: ["dry-run", "no-normalize"],
  default: {
    input: ".harvest/top500.tsv",
    out: ".harvest/sentences",
    state: ".harvest/state.json",
    quota: "500",
    rate: "2.0",
  },
});

const QUOTA = Number(args.quota);
const RATE_MS = Number(args.rate) * 1000;
const TODAY = new Date().toISOString().slice(0, 10);

type State = {
  downloaded: string[];
  failed: { sid: string; reason: string }[];
  daily: Record<string, number>;
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadState(path: string): Promise<State> {
  try { return JSON.parse(await Deno.readTextFile(path)); }
  catch { return { downloaded: [], failed: [], daily: {} }; }
}

async function saveState(path: string, s: State) {
  await Deno.writeTextFile(path, JSON.stringify(s, null, 2));
}

async function fileExists(path: string): Promise<boolean> {
  try { const st = await Deno.stat(path); return st.isFile && st.size > 1000; }
  catch { return false; }
}

async function fetchAudio(audioId: string, dest: string): Promise<{ ok: boolean; reason?: string }> {
  const url = `https://tatoeba.org/audio/download/${audioId}`;
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

type Row = { sid: string; audio_id: string; contrib: string; text: string };

async function readRows(path: string): Promise<Row[]> {
  const tsv = await Deno.readTextFile(path);
  const lines = tsv.trim().split("\n");
  const header = lines[0].split("\t");
  const ix = (k: string) => header.indexOf(k);
  return lines.slice(1).map((l) => {
    const p = l.split("\t");
    return {
      sid: p[ix("sid")],
      audio_id: p[ix("audio_id")],
      contrib: p[ix("contrib")],
      text: p[p.length - 1],
    };
  });
}

async function main() {
  await Deno.mkdir(args.out, { recursive: true });
  const state = await loadState(args.state);
  state.daily[TODAY] = state.daily[TODAY] ?? 0;
  const done = new Set(state.downloaded);
  const rows = await readRows(args.input);

  console.log(`input: ${rows.length} rows`);
  console.log(`already done: ${done.size}`);
  console.log(`today: ${state.daily[TODAY]}/${QUOTA}`);

  let ok = 0, skip = 0, fail = 0;
  const tmpDir = await Deno.makeTempDir({ prefix: "tatoeba-" });

  for (const r of rows) {
    if (state.daily[TODAY] >= QUOTA) {
      console.log(`quota_reached ${QUOTA}`);
      break;
    }
    const slug = slugify(r.text);
    const finalPath = `${args.out}/${slug}.mp3`;

    if (done.has(r.sid) || await fileExists(finalPath)) {
      if (!done.has(r.sid)) { state.downloaded.push(r.sid); done.add(r.sid); }
      skip++;
      continue;
    }

    if (args["dry-run"]) {
      console.log(`[dry] ${r.sid} aid=${r.audio_id} → ${slug}.mp3 :: ${r.text}`);
      continue;
    }

    const tmpPath = `${tmpDir}/${r.audio_id}.mp3`;
    const fetched = await fetchAudio(r.audio_id, tmpPath);
    if (!fetched.ok) {
      console.log(`FAIL fetch sid=${r.sid} aid=${r.audio_id} ${fetched.reason}`);
      state.failed.push({ sid: r.sid, reason: fetched.reason! });
      fail++;
      await new Promise((r) => setTimeout(r, RATE_MS));
      continue;
    }

    if (args["no-normalize"]) {
      await Deno.rename(tmpPath, finalPath);
    } else {
      const norm = await normalize(tmpPath, finalPath);
      if (!norm.ok) {
        console.log(`FAIL normalize sid=${r.sid} ${norm.reason}`);
        state.failed.push({ sid: r.sid, reason: norm.reason! });
        fail++;
        try { await Deno.remove(tmpPath); } catch {}
        await new Promise((r) => setTimeout(r, RATE_MS));
        continue;
      }
      try { await Deno.remove(tmpPath); } catch {}
    }

    state.downloaded.push(r.sid);
    done.add(r.sid);
    state.daily[TODAY]++;
    ok++;

    if (ok % 25 === 0) {
      await saveState(args.state, state);
      console.log(`checkpoint ok=${ok} skip=${skip} fail=${fail} today=${state.daily[TODAY]}`);
    }

    if (state.daily[TODAY] < QUOTA) {
      await new Promise((r) => setTimeout(r, RATE_MS));
    }
  }

  await saveState(args.state, state);
  try { await Deno.remove(tmpDir, { recursive: true }); } catch {}
  console.log(`DONE ok=${ok} skip=${skip} fail=${fail} total_done=${done.size} today=${state.daily[TODAY]}`);
}

main();
