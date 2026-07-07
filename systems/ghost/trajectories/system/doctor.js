import paladin from "@vivalence/paladin";
import { Doctor } from "./Doctor.jsx";

const SCOPES = [
  ["system", 0],
  ["repository", 0],
  ["registry", 0],
  ["variant", 0],
  ["mountpoint", 1],
  ["environment", 1],
];

const FLAGS = ["sudo", "dev", "prod", "runtime", "client", "deployed", "citizen", "veryimportant"];

export async function doctor(ctx) {
  await paladin.ledger.mount();

  const report = {
    identity: {
      role: paladin.role,
      mode: paladin.mode,
      flags: FLAGS.filter((flag) => paladin.is[flag]),
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
    locks: await collectLocks(paladin.scope.ledger),
    instances: await collectInstances(paladin.ledger.instances),
    logs: await collectLogs(paladin.scope.ledger),
    variant: {
      daemons: paladin.variant?.daemons?.length ?? 0,
      services: paladin.variant?.services?.length ?? 0,
      clients: Object.keys(paladin.variant?.clients ?? {}),
      runtime: !!paladin.variant?.runtime && Object.keys(paladin.variant.runtime).length > 0,
    },
    registry: await collectRegistry(paladin),
    vip: paladin.vip?.pensieve?.size ?? 0,
  };

  ctx.effect = report;
  await ctx.view.scroll.emit({ report }, null, Doctor);
}

async function collectLocks(systemScope) {
  if (!systemScope) return [];
  try {
    const dir = systemScope.branch("locks").absolute;
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
        /* malformed */
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

async function collectLogs(systemScope) {
  if (!systemScope) return [];
  try {
    const dir = systemScope.branch("logs").absolute;
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
  if (!paladin.scope.registry) return null;
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
