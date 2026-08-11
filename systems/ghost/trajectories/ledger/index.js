import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { Path, v, Vector } from "@vivalence/typology";

const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();

export const ledger = new Vector();

ledger.open(
  {
    nature: "/install",
    valence: "scaffold the ledger (locks/logs) + seed registry.json from the standard packages",
    schema: v.object({}),
  },
  async (ctx) => {
    const target = ctx.signal.params?.[0];
    if (target) {
      const root = new Path(resolve(cwd(), target));
      paladin.scopes([["ledger", () => true, () => root]]);
      paladin.ledger.registry.path = paladin.scope.ledger.branch("registry.json");
      paladin.ledger.instances.path = paladin.scope.ledger.branch("instances.json");
    }

    for (const sub of ["locks", "logs"]) {
      await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });
    }

    const registry = await paladin.ledger.registry.seed(paladin.scope.registry);

    const instances = paladin.scope.ledger.branch("instances.json");
    if (!(await paladin.read.json(instances, null))) await paladin.state.json(instances, {});

    ctx.effect = { ledger: paladin.scope.ledger.absolute, scaffolded: ["locks", "logs"], registry };
  },
);

ledger.open(
  {
    nature: "/root",
    valence: "show ledger + store roots and the record path",
    schema: v.object({}),
  },
  async (ctx) => {
    ctx.effect = {
      ledger: paladin.scope.ledger.absolute,
      registry: paladin.scope.registry?.absolute ?? null,
      record: paladin.ledger.registry.path.absolute,
    };
  },
);

ledger.open(
  {
    nature: "/tap",
    valence: "tap a package — materialize (local no-op · git clone into the store) + record in registry.json",
    schema: v.object({ source: v.string().desc("path or git url").optional() }),
  },
  async (ctx) => {
    let source = ctx.signal.params?.[0];
    if (!source) throw new Error("usage: viva ledger tap <path | git url>");
    if (/^\.\.?\//.test(source)) source = resolve(cwd(), source);
    const reference = await paladin.vip.tap(source);
    ctx.effect = {
      reference,
      root: paladin.ledger.registry.resolve(reference).absolute,
      record: await paladin.ledger.registry.list(),
    };
  },
);

ledger.open(
  {
    nature: "/taps",
    valence: "list the record — each reference with store root + declared owners",
    schema: v.object({}),
  },
  async (ctx) => {
    await paladin.ledger.mount();
    const references = await paladin.ledger.registry.list();
    ctx.effect = await Promise.all(
      references.map(async (reference) => {
        const root = paladin.ledger.registry.resolve(reference);
        const declarations = await paladin.find.type(root, "package").catch(() => []);
        return {
          reference,
          root: root.absolute,
          declared: declarations.map((module) => module.manifest.owner),
        };
      }),
    );
  },
);

ledger.open(
  {
    nature: "/untap",
    valence: "untap a package — record removal only, the store keeps the working copy",
    schema: v.object({ reference: v.string().desc("recorded reference").optional() }),
  },
  async (ctx) => {
    const reference = ctx.signal.params?.[0];
    if (!reference) throw new Error("usage: viva ledger untap <reference>");
    ctx.effect = { record: await paladin.vip.untap(reference) };
  },
);
