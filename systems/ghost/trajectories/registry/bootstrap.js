import paladin from "@vivalence/paladin";
import { basename, dirname, resolve } from "@std/path";
import { Path } from "@vivalence/typology";
import { clone, lens, path, pick } from "../../belt/index.js";

const declare = ({ owner, slug, version }) =>
  `export const manifest = {\n` +
  `  owner: "${owner}",\n` +
  `  type: "package",\n` +
  `  slug: "${slug}",\n` +
  `  version: "${version}",\n` +
  `};\n`;

const packaged = (root) => paladin.find.type(new Path(root), "package", 0).catch(() => []);

// author + tap. the destination NAMES the package — slug is its basename, owner that slug at-signed —
// so a clone is never born shadowing its source in the pensieve (owner/type/slug is the key).
export async function bootstrap(ctx) {
  const [destination, input] = ctx.signal.params ?? [];
  if (!destination) {
    return (ctx.effect = { error: "usage: /registry/bootstrap <destination> [source]" });
  }

  const target = resolve(path.cwd(), destination);
  const slug = basename(target);
  const owner = `@${slug}`;

  if ((await packaged(target)).length) {
    throw new Error(`bootstrap: ${target} already declares a package — untap and remove it first`);
  }

  let from = null;
  if (input) {
    const chosen = await pick(ctx, await lens.modes({ type: "package" }), input);
    if (chosen?.aborted) return (ctx.effect = { aborted: true });
    if (chosen) {
      const module = await paladin.vip.accio(chosen.reference);
      from = dirname(module.mount.absolute);
    } else {
      const local = path.pin(input);
      const stat = await Deno.stat(local);
      from = stat.isDirectory ? local : dirname(local);
    }
  }

  // the package declaration is the ONE file bootstrap owns — the clone's copy is replaced, never
  // patched, and its name goes with it. every other file rides along untouched.
  let version = "0.0.1";
  if (from) {
    const [held] = await packaged(from);
    version = held?.manifest?.version ?? version;
    await clone.tree(from, target);
    const inherited = held?.source?.filename;
    if (inherited && inherited !== "package.viva.js") {
      await Deno.remove(`${target}/${inherited}`).catch(() => {});
    }
  }

  await Deno.mkdir(target, { recursive: true });
  await Deno.writeTextFile(`${target}/package.viva.js`, declare({ owner, slug, version }));

  await paladin.vip.tap(target);

  ctx.effect = {
    package: `${owner}/package/${slug}`,
    owner,
    slug,
    target,
    from,
    record: await paladin.ledger.registry.list(),
  };
}
