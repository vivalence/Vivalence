import { fromm } from "@vivalence/typology";

const CACHE = "no-cache";

export const serve = (fraught) => async (input, ctx) => {
  const query = fromm.params(ctx.params).path.absolute.replace(/^[/]/, "");
  for (const mode of fraught()) {
    const entry = mode.freight.resolve(query);
    if (!entry) continue;
    const filePath = mode.freight.path.branch("/" + entry.path).absolute;
    const stat = await Deno.stat(filePath);
    const etag = `"${stat.size}-${stat.mtime?.getTime() ?? 0}"`;
    const headers = { "content-type": entry.type, "cache-control": CACHE, etag, "accept-ranges": "bytes" };
    if (ctx.request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    const bytes = await Deno.readFile(filePath);
    const range = /^bytes=(\d*)-(\d*)$/.exec(ctx.request.headers.get("range") ?? "");
    if (!range) return new Response(bytes, { status: 200, headers });
    const start = range[1] ? Number(range[1]) : Math.max(0, bytes.length - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
    if (start > end || start >= bytes.length) {
      return new Response(null, { status: 416, headers: { ...headers, "content-range": `bytes */${bytes.length}` } });
    }
    return new Response(bytes.subarray(start, end + 1), { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${bytes.length}` } });
  }
  ctx.response.status = 404;
};
