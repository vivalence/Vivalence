import * as fs from "@std/fs";
import { join } from "@std/path";
import { Pipe } from "@vivalence/typology";

export default async function system(paladin) {
  const root = paladin.scope.system.absolute;
  const locksDirectory = join(root, "locks");
  const logsDirectory = join(root, "logs");
  const instancesFile = join(root, "instances.json");

  await paladin.state.dir(root);
  await paladin.state.dir(locksDirectory);
  await paladin.state.dir(logsDirectory);

  const readJson = async (path, fallback) => {
    try { return JSON.parse(await Deno.readTextFile(path)); }
    catch { return fallback; }
  };
  const writeJson = (path, data) =>
    Deno.writeTextFile(path, JSON.stringify(data, null, 2));

  const instances = {
    list: () => readJson(instancesFile, {}),
    read: async (slug) => (await readJson(instancesFile, {}))[slug] ?? null,
    write: async (slug, partial) => {
      const all = await readJson(instancesFile, {});
      const now = new Date().toISOString();
      all[slug] = {
        ...(all[slug] ?? { createdAt: now }),
        ...partial,
        updatedAt: now,
      };
      await writeJson(instancesFile, all);
    },
    remove: async (slug) => {
      const all = await readJson(instancesFile, {});
      delete all[slug];
      await writeJson(instancesFile, all);
    },
  };

  const lockPath = (slug, process) => join(locksDirectory, slug, `${process}.lock`);
  const locks = {
    write: async (slug, process, record) => {
      await fs.ensureDir(join(locksDirectory, slug));
      await writeJson(lockPath(slug, process), record);
    },
    read: (slug, process) => readJson(lockPath(slug, process), null),
    remove: async (slug, process) => {
      try { await Deno.remove(lockPath(slug, process)); } catch {}
    },
    list: async (slug) => {
      const dir = join(locksDirectory, slug);
      try {
        const entries = [];
        for await (const entry of Deno.readDir(dir)) {
          if (!entry.name.endsWith(".lock")) continue;
          const process = entry.name.slice(0, -".lock".length);
          entries.push({ process, ...(await locks.read(slug, process)) });
        }
        return entries;
      } catch { return []; }
    },
    alive: async (slug, process) => {
      const lock = await locks.read(slug, process);
      if (!lock) return false;
      try { Deno.kill(lock.pid, "SIGCONT"); return true; }
      catch { return false; }
    },
  };

  const spansFile = (slug) => join(logsDirectory, slug, "spans.jsonl");
  const childLogPath = (slug, process, stream) =>
    join(logsDirectory, slug, `${process}.${stream}.log`);

  const pipe = new Pipe();
  pipe.tap(async (span) => {
    const slug = paladin.env.get("VIVA_PROCESS_SLUG") ?? "ghost";
    await fs.ensureDir(join(logsDirectory, slug));
    await Deno.writeTextFile(spansFile(slug), JSON.stringify(span.json) + "\n", { append: true });
  });

  const logs = {
    pipe,
    spans: spansFile,
    child: childLogPath,
    open: async (slug, process, stream) => {
      await fs.ensureDir(join(logsDirectory, slug));
      return Deno.open(childLogPath(slug, process, stream), {
        write: true, create: true, append: true,
      });
    },
    tail: async (slug, lines = 50) => {
      try {
        const text = await Deno.readTextFile(spansFile(slug));
        return text.trim().split("\n").slice(-lines).map((line) => JSON.parse(line));
      } catch { return []; }
    },
  };

  paladin.system = { instances, locks, logs };
}
