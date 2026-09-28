import { Connection, Url, control, shape, shard, steer } from "@vivalence/typology";
import { mint, run } from "./lib.js";

const routes = (strip) => {
  const held = [];
  const walk = (node, path) => {
    if (node.effect) held.push(path || "/");
    for (const [name, branch] of Object.entries(node.branches ?? {})) walk(branch, `${path}/${name}`);
  };
  walk(strip, "");
  return held.sort();
};

export const boot = async (overrides) => {
  const die = mint(overrides);
  const execution = steer.dispatch.execute(run.runtime, die);
  await control.controlled(die.controller);
  const connection = new Connection(new Url("http://test"), shard.transmitter.inline(shape.http(die.runtime.aperture)));
  const rows = (type, repository) => Object.fromEntries(Object.entries(repository.census()).map(([slug, status]) => [`${type} ${slug}`, status]));
  const held = async (slug) => (await die.runtime.processes.daemon.findOne({ slug })) ?? die.runtime.processes.service.findOne({ slug });
  return {
    die,
    execution,
    connection,
    census: () => routes(shape.strip(die.runtime.aperture)),
    ledger: async () => ({
      ...rows("service", die.runtime.processes.service),
      ...rows("daemon", die.runtime.processes.daemon),
      ...Object.assign({}, ...(await die.runtime.processes.daemon.find()).filter((daemon) => daemon.subject.processes.mode).map((daemon) => rows("mode", daemon.subject.processes.mode))),
    }),
    chronicle: () => {
      const told = {};
      for (const record of die.controller.stdout.records) (told[record.path] ??= []).push(record.verb);
      return told;
    },
    settled: () => {
      const codes = {};
      const walk = (controller) => {
        codes[controller.stdout.absolute] = controller.status.reflection.code;
        for (const child of controller.children) walk(child);
      };
      walk(die.controller);
      return codes;
    },
    kill: async (slug, signal) => (await held(slug)).controller.kill(signal),
    stop: async () => {
      await die.controller.kill("SIGTERM");
      await execution;
    },
  };
};
