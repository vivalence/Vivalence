import paladin from "@vivalence/paladin";
import { Path, specimen, steer, Vector } from "@vivalence/typology";
import { ShellContext, ShellSignal } from "../typology.js";
import trajectories from "../trajectories/index.js";
import { path } from "../belt/index.js";

const { describe, it, beforeAll, expect } = specimen;

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => {
    const result = await effect(ctx);
    ctx.effect ??= result;
  });
  return context.effect;
};

const trajectory = new Vector();
trajectories(trajectory);

const drive = (args) => {
  const signal = new ShellSignal(args);
  return steer.dispatch.invoke(trajectory, signal, strategy)(new ShellContext({ signal }));
};

async function author(root, slug, owner) {
  await Deno.mkdir(`${root}/${slug}`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/${slug}/${slug}.viva.js`,
    `export const manifest = { owner: "${owner}", type: "package", slug: "${slug}", version: "0.4.2" };`,
  );
}

describe("viva registry/{tap,untap,bootstrap}", () => {
  let ledger;
  let store;
  let made;

  beforeAll(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-registry-ledger-" });
    store = await Deno.makeTempDir({ prefix: "ghost-registry-store-" });
    made = await Deno.makeTempDir({ prefix: "ghost-registry-made-" });
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await author(store, "alpha", "@alpha");
    await author(store, "beta", "@beta");
    await Deno.writeTextFile(`${store}/alpha/extra.js`, "export const kept = true;\n");
    await Deno.mkdir(`${store}/alpha/nested`, { recursive: true });
    await Deno.writeTextFile(`${store}/alpha/nested/deep.js`, "export const deep = true;\n");
    await drive(["registry/tap", "alpha"]);
    await drive(["registry/tap", "beta"]);
  });

  it("tap and untap answer under /registry", async () => {
    const tapped = await drive(["registry/tap", "alpha"]);
    expect(tapped.record).toEqual(["alpha", "beta"]);
    const untapped = await drive(["registry/untap", "never-tapped"]);
    expect(untapped.record).toEqual(["alpha", "beta"]);
  });

  it("bootstrap with no source writes one package file, owner and slug from the destination", async () => {
    const target = `${made}/mine`;
    const effect = await drive(["registry/bootstrap", target]);
    expect(effect.slug).toBe("mine");
    expect(effect.owner).toBe("@mine");
    expect(effect.package).toBe("@mine/package/mine");
    expect(effect.from).toBe(null);
    const written = await Deno.readTextFile(`${target}/package.viva.js`);
    expect(written).toContain('owner: "@mine"');
    expect(written).toContain('type: "package"');
    expect(written).toContain('slug: "mine"');
    const files = [];
    for await (const entry of Deno.readDir(target)) files.push(entry.name);
    expect(files).toEqual(["package.viva.js"]);
  });

  it("bootstrap records the package it just authored", async () => {
    const record = await paladin.ledger.registry.list();
    expect(record.includes(`${made}/mine`)).toBe(true);
  });

  it("bootstrap from a source clones the tree and renames the declaration", async () => {
    const target = `${made}/borrowed`;
    const effect = await drive(["registry/bootstrap", target, "alpha"]);
    expect(effect.from).toBe(`${store}/alpha`);
    expect(effect.package).toBe("@borrowed/package/borrowed");

    const written = await Deno.readTextFile(`${target}/package.viva.js`);
    expect(written).toContain('owner: "@borrowed"');
    expect(written).toContain('slug: "borrowed"');
    // the source's version survives the rewrite; its name does not
    expect(written).toContain('version: "0.4.2"');
    expect(await Deno.stat(`${target}/alpha.viva.js`).catch(() => null)).toBe(null);

    // every other file rides along untouched
    expect(await Deno.readTextFile(`${target}/extra.js`)).toBe("export const kept = true;\n");
    expect(await Deno.readTextFile(`${target}/nested/deep.js`)).toBe("export const deep = true;\n");
  });

  it("bootstrap onto a directory that already declares a package throws", async () => {
    const error = await drive(["registry/bootstrap", `${made}/mine`])
      .then(() => null, (thrown) => thrown);
    expect(String(error).includes("already declares a package")).toBe(true);
  });

  it("bootstrap without a destination names the usage", async () => {
    const effect = await drive(["registry/bootstrap"]);
    expect(String(effect.error).includes("usage")).toBe(true);
  });

  it("an ambiguous source in a pipe names the candidates instead of prompting", async () => {
    const error = await drive(["registry/bootstrap", `${made}/ambiguous`, "a"])
      .then(() => null, (thrown) => thrown);
    expect(String(error).includes("@beta/package/beta")).toBe(true);
    expect(await Deno.stat(`${made}/ambiguous`).catch(() => null)).toBe(null);
  });

  it("a remote source survives the cwd frame verbatim", () => {
    const scp = "git@github.com:vivalence/registry-standalone.git";
    expect(path.source(scp)).toBe(scp);
    expect(path.source("https://github.com/vivalence/registry-standalone")).toBe(
      "https://github.com/vivalence/registry-standalone",
    );
    expect(path.source("./local").startsWith("/")).toBe(true);
  });
});
