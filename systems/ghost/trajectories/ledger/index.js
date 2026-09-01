import paladin from "@vivalence/paladin";
import { isAbsolute, resolve } from "@std/path";
import { Path, v, Vector } from "@vivalence/typology";
import { config, envfile, path } from "../../belt/index.js";
import { Init } from "./Init.jsx";
import { Doctor } from "./Doctor.jsx";
import { store } from "../registry/index.js";

const SCAFFOLD = ["locks", "logs", "registry", "instances", "sessions"];

const SCOPES = [
  ["ledger", 0],
  ["repository", 0],
  ["registry", 0],
  ["instance", 0],
  ["mountpoint", 1],
];

// the ledger owns a .env but has no declaration to hang a sibling export on, so its schema is here.
// same shape as an instance's `environment`, same writer, same doctor rendering.
const environment = v.environment({
  VIVA_REPOSITORY_MOUNT: v.string().desc("Absolute path to the vivalence checkout. Repo-relative resolution needs it.").group("homes"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Machine-wide Anthropic key.").group("keys").optional(),
  SECRET_VIVA_OPENROUTER_API_KEY: v.string().desc("Machine-wide OpenRouter key.").group("keys").optional(),
  SECRET_VIVA_ELEVENLABS_API_KEY: v.string().desc("Machine-wide ElevenLabs key.").group("keys").optional(),
  SECRET_VIVA_DEEPGRAM_API_KEY: v.string().desc("Machine-wide Deepgram key.").group("keys").optional(),
});

export const ledger = new Vector();

ledger.open(
  {
    nature: "/init",
    valence: "machine first-run — pick + persist the ledger home, scaffold locks/logs/registry/instances",
    schema: v.object({ path: v.string().desc("ledger home (skips the wizard)").optional() }),
  },
  async (ctx) => {
    const target = ctx.signal.params?.[0];
    const home = paladin.scope.ledger.absolute;
    let choice;
    if (target) {
      choice = { mount: resolve(path.cwd(), target), persisted: false };
    } else if (!ctx.interactive) {
      choice = { mount: home, persisted: false };
    } else {
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

    const env = paladin.scope.ledger.branch(".env");
    if (!(await paladin.read.text(env).catch(() => null))) {
      await paladin.state.text(env, envfile.scaffold(environment));
    }
    const seed = Object.entries(environment.properties).filter(
      ([key]) => paladin.env.get(key) === null && paladin.secret.get(key) === null,
    );

    ctx.effect = {
      ...choice,
      ledger: paladin.scope.ledger.absolute,
      scaffolded: SCAFFOLD,
      env: env.absolute,
      fill: seed.map(([key]) => key),
    };
  },
);

ledger.open(
  {
    nature: "/doctor",
    valence: "ledger report card — every organ of the ledger home with its count and anomalies, then the environment strata",
    schema: v.object({}),
  },
  async (ctx) => {
    if (paladin.scope.instance) await Promise.resolve(paladin.instance.mount()).catch(() => null);
    const home = paladin.scope.ledger;
    const env = home.branch(".env");
    const record = await collectRecord(paladin.ledger.registry);

    const report = {
      homes: {
        ledger: home.absolute,
        store: paladin.scope.registry?.absolute ?? null,
        instances: home.branch("instances").absolute,
        record: paladin.ledger.registry.path.absolute,
      },
      scopes: SCOPES.map(([name, depth]) => ({
        name,
        depth,
        present: name in paladin.scope,
        path: paladin.scope[name]?.absolute ?? null,
      })),
      env: {
        path: env.absolute,
        present: Boolean(await paladin.read.text(env).catch(() => null)),
        vars: Object.keys(paladin.env.strata.get("ledger") ?? {}),
        secrets: Object.keys(paladin.secret.strata.get("ledger") ?? {}),
        blank: Object.entries({ ...paladin.env.strata.get("ledger"), ...paladin.secret.strata.get("ledger") })
          .filter(([, value]) => !value)
          .map(([key]) => key),
      },
      record,
      store: await store(paladin, record.entries.map((entry) => entry.root)),
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

    ctx.effect = report;
    await ctx.view?.scroll.emit({ report }, null, Doctor);
  },
);

async function collectRecord(registry) {
  const references = await registry.list();
  const entries = await Promise.all(
    references.map(async (reference) => {
      const root = registry.resolve(reference);
      return {
        reference,
        root: root.absolute,
        pinned: isAbsolute(reference),
        present: Boolean(await Deno.stat(root.absolute).catch(() => null)),
      };
    }),
  );
  return { path: registry.path.absolute, entries };
}

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
      const mount = payload?.VIVA_INSTANCE_MOUNT ?? null;
      const held = mount ? await ledger.instances.lookup(mount) : null;
      out.push({ shell, instance: held?.slug ?? null, ...payload });
    }
  } catch {
    return out;
  }
  return out;
}

async function collectLocks(ledger) {
  const dir = ledger.paladin.scope.ledger.branch("locks").absolute;
  const out = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (!entry.name.endsWith(".lock")) continue;
      const held = await ledger.lock(entry.name.slice(0, -".lock".length)).read();
      if (held) out.push(held);
    }
  } catch {
    return out;
  }
  return out;
}

async function collectInstances(instances) {
  if (!instances?.path?.absolute) return [];
  try {
    const all = JSON.parse(await Deno.readTextFile(instances.path.absolute));
    const rows = [];
    const mounts = new Set();
    for (const [slug, info] of Object.entries(all)) {
      const mount = info?.mount ?? null;
      mounts.add(mount);
      const flags = [];
      if (!mount || !(await Deno.stat(mount).catch(() => null))) {
        flags.push("dangling");
      } else {
        const shelf = instances.shelf(slug).absolute;
        if (mount !== shelf && (await Deno.stat(shelf).catch(() => null))) flags.push("shadowed");
      }
      rows.push({
        slug,
        valence: info?.valence ?? null,
        mount,
        createdAt: info?.createdAt ?? null,
        updatedAt: info?.updatedAt ?? null,
        ...(flags.length ? { flags } : {}),
      });
    }
    try {
      const shelves = instances.paladin.scope.ledger.branch("instances").absolute;
      for await (const entry of Deno.readDir(shelves)) {
        if (!entry.isDirectory) continue;
        const path = `${shelves}/${entry.name}`;
        if (!mounts.has(path)) rows.push({ slug: entry.name, mount: path, flags: ["orphan — tap it"] });
      }
    } catch {
      return rows;
    }
    return rows;
  } catch {
    return [];
  }
}

async function collectLogs(home) {
  const dir = home.branch("logs").absolute;
  const out = [];
  try {
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
  } catch {
    return out;
  }
  return out;
}
