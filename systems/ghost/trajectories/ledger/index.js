import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { Path, v, Vector } from "@vivalence/typology";
import { config } from "../../belt/index.js";
import { Init } from "./Init.jsx";
import { Doctor } from "./Doctor.jsx";

const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();

const SCAFFOLD = ["locks", "logs", "registry", "variants"];

const SCOPES = [
  ["ledger", 0],
  ["repository", 0],
  ["registry", 0],
  ["variant", 0],
  ["mountpoint", 1],
  ["environment", 1],
];

const FLAGS = ["sudo", "dev", "prod", "runtime", "client", "deployed", "citizen", "veryimportant"];

export const ledger = new Vector();

ledger.open(
  {
    nature: "/init",
    valence: "machine first-run — pick + persist the ledger home, scaffold locks/logs/registry/variants",
    schema: v.object({ path: v.string().desc("ledger home (skips the wizard)").optional() }),
  },
  async (ctx) => {
    const target = ctx.signal.params?.[0];
    let choice;
    if (target) {
      choice = { mount: resolve(cwd(), target), persisted: false };
    } else {
      const home = paladin.scope.ledger.absolute;
      const exportLineFor = (mount) => `export VIVA_LEDGER_MOUNT="${mount}"`;
      const persist = (mount) => config.writeShellConfig("VIVA_LEDGER_MOUNT", mount);
      choice = await ctx.view.scroll.render({ home, persist, exportLineFor }, null, Init);
      if (!choice || choice.aborted) return (ctx.effect = { aborted: true });
    }

    const root = new Path(choice.mount);
    paladin.scopes([["ledger", () => true, () => root]]);
    await paladin.ledger.mount();
    paladin.ledger.registry.path = paladin.scope.ledger.branch("registry.json");
    paladin.ledger.instances.path = paladin.scope.ledger.branch("instances.json");

    for (const sub of SCAFFOLD) {
      await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });
    }

    const instances = paladin.scope.ledger.branch("instances.json");
    if (!(await paladin.read.json(instances, null))) await paladin.state.json(instances, {});

    ctx.effect = { ...choice, ledger: paladin.scope.ledger.absolute, scaffolded: SCAFFOLD };
  },
);

ledger.open(
  {
    nature: "/tap",
    valence: "tap a package — record a reference; a remote source clones into the store (or target)",
    schema: v.object({
      source: v.string().desc("path or git url").optional(),
      target: v.string().desc("clone destination for a remote source").optional(),
    }),
  },
  async (ctx) => {
    let [source, target] = ctx.signal.params ?? [];
    if (!source) throw new Error("usage: viva ledger tap <path | git url> [target]");
    if (source.startsWith("./") || source.startsWith("../")) source = resolve(cwd(), source);
    if (target) target = resolve(cwd(), target);
    const reference = await paladin.vip.tap(source, target);
    ctx.effect = {
      reference,
      root: paladin.ledger.registry.resolve(reference).absolute,
      record: await paladin.ledger.registry.list(),
    };
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

ledger.open(
  {
    nature: "/doctor",
    valence: "machine report card — homes, record, store census, locks, processes, logs",
    schema: v.object({}),
  },
  async (ctx) => {
    await paladin.ledger.mount();

    const references = await paladin.ledger.registry.list();
    const record = await Promise.all(
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

    const report = {
      identity: {
        role: paladin.role,
        mode: paladin.mode,
        flags: FLAGS.filter((flag) => paladin.is[flag]),
      },
      homes: {
        ledger: paladin.scope.ledger.absolute,
        store: paladin.scope.registry?.absolute ?? null,
        variants: paladin.scope.ledger.branch("variants").absolute,
        record: paladin.ledger.registry.path.absolute,
      },
      scopes: SCOPES.map(([name, depth]) => ({
        name,
        depth,
        present: name in paladin.scope,
        path: paladin.scope[name]?.absolute ?? null,
      })),
      environment: Object.entries(paladin.env.vars).map(([key, value]) => ({ key, value })),
      secrets: Object.keys(paladin.secret?.vars ?? {}).length,
      processes: {
        armed: paladin.ledger.armed,
        attached: [...paladin.ledger.attached].map((process) => ({
          pid: process.pid,
          type: process.spec?.type ?? null,
          slug: process.spec?.slug ?? null,
        })),
      },
      record,
      registry: await collectRegistry(paladin),
      locks: await collectLocks(paladin.scope.ledger),
      instances: await collectInstances(paladin.ledger.instances),
      logs: await collectLogs(paladin.scope.ledger),
      variant: {
        daemons: paladin.variant?.daemons?.length ?? 0,
        services: paladin.variant?.services?.length ?? 0,
        clients: Object.keys(paladin.variant?.clients ?? {}),
        runtime: !!paladin.variant?.runtime && Object.keys(paladin.variant.runtime).length > 0,
      },
      vip: paladin.vip?.pensieve?.size ?? 0,
    };

    ctx.effect = report;
    await ctx.view?.scroll.emit({ report }, null, Doctor);
  },
);

async function collectLocks(ledgerScope) {
  if (!ledgerScope) return [];
  try {
    const dir = ledgerScope.branch("locks").absolute;
    const out = [];
    for await (const entry of Deno.readDir(dir)) {
      if (!entry.name.endsWith(".lock")) continue;
      const stem = entry.name.slice(0, -".lock".length);
      const sep = stem.indexOf("_");
      if (sep < 0) continue;
      const type = stem.slice(0, sep);
      const slug = stem.slice(sep + 1);
      let payload = null;
      try {
        payload = JSON.parse(await Deno.readTextFile(`${dir}/${entry.name}`));
      } catch {
        payload = null;
      }
      out.push({ type, slug, pid: payload?.pid ?? null });
    }
    return out;
  } catch {
    return [];
  }
}

async function collectInstances(instances) {
  if (!instances?.path?.absolute) return [];
  try {
    const all = JSON.parse(await Deno.readTextFile(instances.path.absolute));
    return Object.entries(all).map(([slug, info]) => ({
      slug,
      createdAt: info?.createdAt ?? null,
      updatedAt: info?.updatedAt ?? null,
    }));
  } catch {
    return [];
  }
}

async function collectLogs(ledgerScope) {
  if (!ledgerScope) return [];
  try {
    const dir = ledgerScope.branch("logs").absolute;
    const out = [];
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isDirectory) {
        const sub = `${dir}/${entry.name}`;
        for await (const file of Deno.readDir(sub)) {
          if (!file.isFile) continue;
          const stat = await Deno.stat(`${sub}/${file.name}`);
          out.push({
            name: `${entry.name}/${file.name}`,
            size: stat.size,
            mtime: stat.mtime?.toISOString() ?? null,
          });
        }
      } else if (entry.isFile) {
        const stat = await Deno.stat(`${dir}/${entry.name}`);
        out.push({
          name: entry.name,
          size: stat.size,
          mtime: stat.mtime?.toISOString() ?? null,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function collectRegistry(paladin) {
  try {
    await paladin.vip.supply();
    const byType = {};
    for (const [owner, ownerMap] of paladin.vip.pensieve) {
      for (const [type, typeMap] of ownerMap) {
        for (const [slug, slugMap] of typeMap) {
          for (const [version] of slugMap) {
            (byType[type] ??= []).push({ owner, slug, version });
          }
        }
      }
    }
    const total = Object.values(byType).reduce((sum, list) => sum + list.length, 0);
    return { total, byType };
  } catch (error) {
    return { error: error.message };
  }
}
