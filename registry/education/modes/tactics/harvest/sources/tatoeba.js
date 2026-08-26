const PERMISSIVE = /^(CC0|CC BY(?!-))/;

export const tatoeba = ({ agent }) => ({
  slug: "tatoeba",

  resolve: async ({ text, language }) => {
    const url =
      `https://tatoeba.org/en/api_v0/search?from=${language}&has_audio=yes` +
      `&query=${encodeURIComponent(`="${text}"`)}`;
    const res = await fetch(url, { headers: { "User-Agent": agent } });
    if (!res.ok) throw new Error(`[tatoeba] search ${res.status}`);
    const { results = [] } = await res.json();
    const audio = results
      .filter((result) => result.text.trim() === text.trim())
      .flatMap((result) => result.audios.map((held) => ({ ...held, sentence: result.id })))
      .filter((held) => !held.license || PERMISSIVE.test(held.license))[0];
    return audio
      ? {
          source: "tatoeba",
          author: audio.author,
          license: audio.license ?? "Tatoeba terms",
          audio: audio.id,
          sentence: audio.sentence,
        }
      : null;
  },

  fetch: async (found) => {
    const res = await fetch(`https://tatoeba.org/audio/download/${found.audio}`, {
      headers: { "User-Agent": agent },
    });
    if (!res.ok) throw new Error(`[tatoeba] download ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  },
});
