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
  const rows = async (repository) => Object.fromEntries((await repository.find({})).map((held) => [`${held.type} ${held.slug}`, held.status]));
  const held = (slug) => die.runtime.entities.process.findOne({ slug });
  return {
    die,
    execution,
    connection,
    census: () => routes(shape.strip(die.runtime.aperture)),
    ledger: async () => ({
      ...(await rows(die.runtime.entities.process)),
      ...Object.assign({}, ...(await Promise.all(Object.values(die.runtime.daemons).filter((daemon) => daemon.entities).map((daemon) => rows(daemon.entities.process))))),
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
