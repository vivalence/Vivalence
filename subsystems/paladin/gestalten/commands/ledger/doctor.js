import { isAbsolute, relative } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import { RECIPE } from "../../../ledger/prototype.js";
import { recipe as voice, registry } from "../belt/index.js";

const SCOPES = [
  ["ledger", 0],
  ["repository", 0],
  ["registry", 0],
  ["instance", 0],
  ["mountpoint", 1],
];

const SLOTS = Object.keys(v.primitives.instance.Ledger.properties).filter((slot) => slot !== "manifest");

async function collectRecord(held) {
  const record = await held.tapped();
  const entries = await Promise.all(
    Object.entries(record).map(async ([owner, { mount, remote }]) => {
      const root = held.resolve(mount);
      return {
        owner,
        mount,
        root: root.absolute,
        remote: remote ?? null,
        pinned: isAbsolute(mount),
        present: Boolean(await Deno.stat(root.absolute).catch(() => null)),
      };
    }),
  );
  return { path: held.path?.absolute ?? null, entries };
}

const label = (home, record) => (record.path ? relative(home.absolute, record.path.absolute) : `inline · ${record.from}`);

async function collectSessions(ledger) {
  const dir = ledger.paladin.scope.ledger.branch("sessions");
  const out = [];
  try {
    for await (const entry of Deno.readDir(dir.absolute)) {
      if (!entry.name.endsWith(".json")) continue;
      const shell = Number(entry.name.slice(0, -".json".length));
      const payload = await ledger.paladin.read.json(dir.branch(entry.name), null).catch(() => null);
      try {
        Deno.kill(shell, "SIGURG");
      } catch {
        await Deno.remove(dir.branch(entry.name).absolute).catch(() => {});
        continue;
      }
      const at = payload?.VIVA_INSTANCE_MOUNT ?? null;
      const held = at ? await ledger.instances.lookup(at) : null;
      out.push({ shell, instance: held?.slug ?? null, ...payload });
    }
  } catch {
    return out;
  }
  return out;
}

async function collectLocks(ledger) {
  const row = (held) => [`${held.process}=${held.pid}`, held.status, held.serve].filter(Boolean).join(" ");
  return (await ledger.locks()).map((held) => ({ ...held, processes: held.processes.map(row).join(" · ") }));
}

async function collectInstances(instances) {
  try {
    const all = await instances.all();
    const rows = [];
    const mounts = new Set();
    for (const [slug, info] of Object.entries(all)) {
      const at = info?.mount ?? null;
      mounts.add(at);
      const flags = [];
      if (!at || !(await Deno.stat(at).catch(() => null))) flags.push("dangling");
      else {
        const shelf = instances.shelf(slug).absolute;
        if (at !== shelf && (await Deno.stat(shelf).catch(() => null))) flags.push("shadowed");
      }
      rows.push({
        slug,
        valence: info?.valence ?? null,
        mount: at,
        createdAt: info?.createdAt ?? null,
        updatedAt: info?.updatedAt ?? null,
        ...(flags.length ? { flags } : {}),
      });
    }
    try {
      const shelves = instances.paladin.scope.ledger.branch("instances").absolute;
      for await (const entry of Deno.readDir(shelves)) {
        if (!entry.isDirectory) continue;
        const at = `${shelves}/${entry.name}`;
        if (!mounts.has(at)) rows.push({ slug: entry.name, mount: at, flags: ["orphan — tap it"] });
      }
    } catch {
      return rows;
    }
    return rows;
  } catch {
    return [];
  }
}

const described = async (at, name) => {
  const stat = await Deno.stat(at);
  return { name, size: stat.size, mtime: stat.mtime?.toISOString() ?? null };
};

async function collectLogs(home) {
  const dir = home.branch("logs").absolute;
  const out = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile) out.push(await described(`${dir}/${entry.name}`, entry.name));
      if (!entry.isDirectory) continue;
      for await (const file of Deno.readDir(`${dir}/${entry.name}`)) {
        if (file.isFile) out.push(await described(`${dir}/${entry.name}/${file.name}`, `${entry.name}/${file.name}`));
      }
    }
  } catch {
    return out;
  }
  return out;
}

export const doctor = new Vector().open(
  {
    nature: "/ledger/doctor",
    valence: "ledger report card — every organ of the ledger home with its count and anomalies, then the environment strata. Example: viva ledger/doctor",
    input: v.object({}),
  },
  async () => {
    if (paladin.scope.instance) await Promise.resolve(mount(paladin.instance)).catch(() => null);
    const home = paladin.scope.ledger;
    const env = home.branch(".env");
    const record = await collectRecord(paladin.ledger.registry);
    const declaration = await paladin.ledger.recipe().catch((error) => ({ error: error.message }));
    const spoken = declaration && !declaration.error;
    const found = await paladin.find.viva(home, 0).catch(() => []);

    return {
      homes: {
        ledger: home.absolute,
        store: paladin.scope.registry?.absolute ?? null,
        instances: home.branch("instances").absolute,
        record: paladin.ledger.registry.path?.absolute ?? null,
      },
      recipe: {
        path: declaration?.source?.absolute ?? found[0]?.absolute ?? home.branch(RECIPE).absolute,
        present: Boolean(spoken) || found.length > 0,
        spoken: Boolean(spoken),
        manifest: spoken ? declaration.manifest : null,
        slots: spoken ? Object.keys(voice.spoken(declaration, SLOTS)) : [],
        declared: spoken ? voice.spoken(declaration, SLOTS) : {},
        ...(declaration?.error ? { error: declaration.error } : {}),
      },
      scopes: await Promise.all(
        SCOPES.map(async ([name, depth]) => ({
          name,
          depth,
          present: Boolean(paladin.scope[name] && (await Deno.stat(paladin.scope[name].absolute).catch(() => null))),
          path: paladin.scope[name]?.absolute ?? null,
        })),
      ),
      env: {
        path: env.absolute,
        present: Boolean(await paladin.read.text(env).catch(() => null)),
        vars: Object.keys(paladin.env.strata.get("ledger") ?? {}),
        secrets: Object.keys(paladin.secret.strata.get("ledger") ?? {}),
        blank: Object.entries({ ...paladin.env.strata.get("ledger"), ...paladin.secret.strata.get("ledger") })
          .filter(([, value]) => !value)
          .map(([key]) => key),
      },
      records: Object.fromEntries(["instances", "registry"].map((slot) => [slot, label(home, paladin.ledger[slot])])),
      record,
      store: await registry.store(record.entries.map((entry) => entry.root)),
      instances: await collectInstances(paladin.ledger.instances),
      locks: await collectLocks(paladin.ledger),
      sessions: await collectSessions(paladin.ledger),
      logs: await collectLogs(home),
      environment: Object.keys(paladin.env.vars).map((key) => {
        const [{ stratum, value }, ...shadowed] = paladin.env.strati(key);
        return { key, value, stratum, ...(shadowed.length ? { shadowed } : {}) };
      }),
      strata: paladin.env.order,
    };
  },
);
