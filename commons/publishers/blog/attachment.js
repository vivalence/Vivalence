import { join, relative } from "@std/path";
import paladin from "@vivalence/paladin";
import { fromm, Vector } from "@vivalence/typology";

const missing = () => new Response(null, { status: 404 });

const served = async (ctx) => {
  const asked = relative("/", fromm.params(ctx.params).path.absolute);
  const places = [asked, `${asked}.html`, join(asked, "index.html")];
  const files = await ctx.runtime.entities.file.find({ mode: ctx.mode.id, path: { $in: places } });
  const file = places
    .map((place) => files.find((file) => file.path === place))
    .find((file) => file !== undefined);
  if (file === undefined) return missing();

  ctx.response.headers.set("etag", `"${file.integrity}"`);
  ctx.response.headers.set("cache-control", "no-cache");
  if (ctx.request.headers.get("if-none-match") === `"${file.integrity}"`)
    return new Response(null, { status: 304, headers: Object.fromEntries(ctx.response.headers) });
  ctx.response.type = file.mime;
  return await paladin.read.bytes(file.mount);
};

export const attachment = new Vector().open("/", served).open("/(.*)", served);
