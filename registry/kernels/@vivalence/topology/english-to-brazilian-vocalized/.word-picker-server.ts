import { serveDir } from "https://deno.land/std@0.220.0/http/file_server.ts";

const PICKS_PATH = new URL("./word-audio-picks.json", import.meta.url).pathname;
const STATIC_ROOT = new URL("./", import.meta.url).pathname;
const HTML_PATH = new URL("./.word-picker.html", import.meta.url).pathname;

const loadPicks = async () => {
  try { return JSON.parse(await Deno.readTextFile(PICKS_PATH)); }
  catch { return { picks: {}, skips: {} }; }
};

const savePicks = async (data) =>
  Deno.writeTextFile(PICKS_PATH, JSON.stringify(data, null, 2));

const handler = async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = await Deno.readTextFile(HTML_PATH);
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  if (url.pathname === "/api/picks" && req.method === "GET")
    return Response.json(await loadPicks());

  if (url.pathname === "/api/picks" && req.method === "POST") {
    const body = await req.json();
    await savePicks(body);
    return Response.json({ ok: true, saved: Object.keys(body.picks || {}).length });
  }

  return serveDir(req, { fsRoot: STATIC_ROOT, quiet: true });
};

Deno.serve({ port: 3456 }, handler);
