import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { Path, v, Vector } from "@vivalence/typology";
import { config, path } from "../../belt/index.js";
import { Init } from "./Init.jsx";
import { Doctor } from "./Doctor.jsx";

const SCAFFOLD = ["locks", "logs", "registry", "instances", "sessions"];

const SCOPES = [
  ["ledger", 0],
  ["repository", 0],
  ["registry", 0],
  ["instance", 0],
  ["mountpoint", 1],
  ["environment", 1],
];

const FLAGS = ["sudo", "dev", "prod", "runtime", "client", "deployed", "citizen", "veryimportant"];

export const ledger = new Vector();

ledger.open(
  {
    nature: "/init",
    valence: "machine first-run — pick + persist the ledger home, scaffold locks/logs/registry/instances",
    schema: v.object({ path: v.string().desc("ledger home (skips the wizard)").optional() }),
  },
  async (ctx) => {
    const target = ctx.signal.params?.[0];
    let choice;
    if (target) {
      choice = { mount: resolve(path.cwd(), target), persisted: false };
    } else {
      const home = paladin.scope.ledger.absolute;
      const exportLineFor = (mount) => `export VIVA_LEDGER_MOUNT="${mount}"`;
      const persist = (mount) => config.writeShellConfig("VIVA_LEDGER_MOUNT", mount);
      choice = await ctx.view.scroll.render({ home, persist, exportLineFor }, null, Init);
      if (!choice || choice.aborted) return (ctx.effect = { aborted: true });
    }

    const root = new Path(choice.mount);
    paladin.scopes([["ledger", () => true, () => root]]);
    for (const sub of SCAFFOLD) {
      await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });
    }

    const instances = paladin.scope.ledger.branch("instances.json");
    if (!(await paladin.read.json(instances, null))) await paladin.state.json(instances, {});

    await config.writeShellConfig("VIVA_PROCESS_ID", "$$");

    ctx.effect = { ...choice, ledger: paladin.scope.ledger.absolute, scaffolded: SCAFFOLD };
  },
);

ledger.open(
  {
    nature: "/doctor",
    valence: "machine report card — homes, record, store census, locks, processes, logs",
    schema: v.object({}),
  },
  async (ctx) => {
    if (paladin.scope.instance) await Promise.resolve(paladin.instance.mount()).catch(() => null);
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
        instances: paladin.scope.ledger.branch("instances").absolute,
        record: paladin.ledger.registry.path.absolute,
      },
      scopes: SCOPES.map(([name, depth]) => ({
        name,
        depth,
        present: name in paladin.scope,
        path: paladin.scope[name]?.absolute ?? null,
      })),
      environment: Object.keys(paladin.env.vars).map((key) => {
        const [{ stratum, value }, ...shadowed] = paladin.env.strati(key);
        return { key, value, stratum, ...(shadowed.length ? { shadowed } : {}) };
      }),
      strata: paladin.env.order,
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
      sessions: await collectSessions(paladin.scope.ledger),
      instances: await collectInstances(paladin.ledger.instances),
      logs: await collectLogs(paladin.scope.ledger),
      instance: {
        daemons: paladin.instance?.daemons?.length ?? 0,
        services: paladin.instance?.services?.length ?? 0,
        clients: Object.keys(paladin.instance?.clients ?? {}),
        runtime: !!paladin.instance?.runtime && Object.keys(paladin.instance.runtime).length > 0,
      },
      vip: paladin.vip?.pensieve?.size ?? 0,
    };

    ctx.effect = report;
    await ctx.view?.scroll.emit({ report }, null, Doctor);
  },
);

async function collectSessions(ledgerScope) {
  if (!ledgerScope) return [];
  try {
    const dir = ledgerScope.branch("sessions").absolute;
    const out = [];
    for await (const entry of Deno.readDir(dir)) {
      if (!entry.name.endsWith(".json")) continue;
      const shell = Number(entry.name.slice(0, -".json".length));
      let payload = null;
      try {
        payload = JSON.parse(await Deno.readTextFile(`${dir}/${entry.name}`));
      } catch {
        payload = null;
      }
      try {
        Deno.kill(shell, "SIGURG");
      } catch {
        await Deno.remove(`${dir}/${entry.name}`).catch(() => {});
        continue;
      }
      out.push({ shell, ...payload });
    }
    return out;
  } catch {
    return [];
  }
}

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
      mount: info?.mount ?? null,
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
    const byOwner = {};
    for (const [type, list] of Object.entries(byType)) {
      for (const { owner, slug } of list) {
        ((byOwner[owner] ??= {})[type] ??= []).push(slug);
      }
    }
    const total = Object.values(byType).reduce((sum, list) => sum + list.length, 0);
    return { total, byType, byOwner };
  } catch (error) {
    return { error: error.message };
  }
}
