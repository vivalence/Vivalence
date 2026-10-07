import paladin from "@vivalence/paladin";
import { shard, shape } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";

export const prune = async (die, next) => {
  await host.prune(die.host);
  await next();
};

export const ledger = async (die, next) => {
  const log = paladin.ledger.log(die.runtime.instance.manifest.slug);
  die.controller.stdout.to((record) => log.append({ json: record }));
  await next();
};

export const patrol = async (die, next) => {
  const beat = setInterval(
    () => die.controller.stdout.note({ service: die.runtime.processes.service.census(), daemon: die.runtime.processes.daemon.census() }),
    60000,
  );
  try {
    await next();
  } finally {
    clearInterval(beat);
  }
};

export const serve = async (die, next) => {
  const url = die.mask.statics.serve;
  die.aperture.open("/multiplex", shard.serve.multiplex(die.aperture));
  const server = Deno.serve(
    { port: Number(url.port), hostname: url.hostname, signal: die.controller.abort.signal, onListen() {} },
    shard.cors.wrap(shape.http(die.aperture)),
  );
  try {
    await next();
  } finally {
    await server.shutdown();
  }
};
