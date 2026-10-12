import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { path } from "../../../gestalten/belt/index.js";

export const tap = new Vector().open(
  {
    nature: "/instance/tap",
    valence: "tap an instance dir placed by hand — record slug → mount; the dir stays where it is. Example: viva instance/tap ./chess --slug=chess",
    schema: v.object({ mount: v.string().desc("the instance dir, a path. Example: ./chess") }),
  },
  async (ctx) => {
    const [token] = ctx.signal.body;
    const { slug } = ctx.signal.flags;
    if (token === undefined || slug === undefined) throw new Error("usage: viva instance/tap <path> --slug=<slug>");
    if (!token.includes("/") && !token.startsWith(".")) throw new Error(`'${token}' is a slug-shaped token — a tap takes a PATH; try ./${token}`);
    const mount = path.pin(token);
    const stat = await Deno.stat(mount).catch(() => null);
    if (stat === null || !stat.isDirectory) throw new Error(`no directory at ${mount}`);
    if (await paladin.ledger.instances.read(slug)) throw new Error(`instance '${slug}' exists — viva instance/rename moves it`);
    await paladin.ledger.instances.write(slug, { mount });
    return { tapped: slug, mount };
  },
);
