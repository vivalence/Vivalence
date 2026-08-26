const API = "https://commons.wikimedia.org/w/api.php";
const CACHE = new URL("../.cache/", import.meta.url).pathname;
const PERMISSIVE = /^(CC0|CC BY(-SA)?\b|Public domain)/i;

const form = (title) => title.match(/-([^-]+)\.[a-z0-9]+$/i)?.[1]?.toLowerCase() ?? null;

const index = async (agent, language) => {
  const cache = `${CACHE}commons-${language}.json`;
  const held = await Deno.readTextFile(cache).then(JSON.parse).catch(() => null);
  if (held) return held;

  const category = `Category:Lingua Libre pronunciation-${language}`;
  const built = {};
  let cmcontinue = null;
  do {
    const url =
      `${API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}` +
      `&cmtype=file&cmlimit=500&format=json` +
      (cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : "");
    const res = await fetch(url, { headers: { "User-Agent": agent } });
    if (!res.ok) throw new Error(`[commons] categorymembers ${res.status}`);
    const data = await res.json();
    for (const member of data.query?.categorymembers ?? []) {
      const key = form(member.title);
      if (key && !built[key]) built[key] = member.title;
    }
    cmcontinue = data.continue?.cmcontinue ?? null;
  } while (cmcontinue);

  await Deno.mkdir(CACHE, { recursive: true });
  await Deno.writeTextFile(cache, JSON.stringify(built));
  return built;
};

export const commons = ({ agent }) => ({
  slug: "commons",

  resolve: async ({ text, language }) => {
    const forms = await index(agent, language);
    const title = forms[text.trim().toLowerCase()];
    if (!title) return null;

    const url =
      `${API}?action=query&titles=${encodeURIComponent(title)}` +
      `&prop=imageinfo&iiprop=url%7Cextmetadata&format=json`;
    const res = await fetch(url, { headers: { "User-Agent": agent } });
    if (!res.ok) throw new Error(`[commons] imageinfo ${res.status}`);
    const data = await res.json();
    const info = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
    if (!info?.url) return null;

    const license = info.extmetadata?.LicenseShortName?.value ?? "";
    if (!PERMISSIVE.test(license)) return null;
    const author = (info.extmetadata?.Artist?.value ?? "").replace(/<[^>]*>/g, "").trim();
    return { source: "commons", author, license, title, url: info.url };
  },

  fetch: async (found) => {
    const res = await fetch(found.url, { headers: { "User-Agent": agent } });
    if (!res.ok) throw new Error(`[commons] download ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  },
});
