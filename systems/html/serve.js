import { serveDir } from "jsr:@std/http/file-server";

const root = new URL("./build", import.meta.url).pathname;

Deno.serve({ port: 1794, hostname: "0.0.0.0" }, async (req) => {
  const res = await serveDir(req, { fsRoot: root, quiet: true });
  if (res.status === 404) {
    const fallback = await Deno.readFile(`${root}/200.html`);
    return new Response(fallback, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  return res;
});
