const FLOOR = 4000;

export const normalize = async (bytes) => {
  if (!bytes?.length) return null;
  const dir = await Deno.makeTempDir();
  const raw = `${dir}/raw`;
  const out = `${dir}/out.mp3`;
  try {
    await Deno.writeFile(raw, bytes);
    const norm = await new Deno.Command("ffmpeg", {
      args: ["-y", "-i", raw, "-af", "loudnorm=I=-18:TP=-2:LRA=11", "-ar", "44100", "-b:a", "128k", out],
    }).output();
    if (!norm.success) return null;
    const normalized = await Deno.readFile(out).catch(() => null);
    return normalized && normalized.length >= FLOOR ? normalized : null;
  } finally {
    await Deno.remove(dir, { recursive: true }).catch(() => {});
  }
};
