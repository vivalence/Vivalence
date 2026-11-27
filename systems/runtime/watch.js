import paladin from "@vivalence/paladin";
import { Datasink } from "@vivalence/typology";
import { dirname } from "@std/path";

const registry = await paladin.ledger.registry.supply();

const modules = [...registry.pensieve.values()]
  .flatMap((types) => [...types.values()])
  .flatMap((slugs) => [...slugs.values()])
  .map((versions) => registry.pensieve.latest(versions));

const drained = modules
  .filter((module) => module.datasink)
  .flatMap((module) =>
    new Datasink(module.datasink).sinks.map((sink) =>
      `${module.source.dirname}/${sink.target.split ? dirname(sink.target.write) : sink.target.write}`
    )
  );

const repository = paladin.scope.repository;
const watched = [
  repository.branch("systems/runtime").absolute,
  repository.branch("subsystems").absolute,
  repository.branch("commons").absolute,
  paladin.scope.registry.absolute,
];

const saved = (event) =>
  event.kind !== "access" &&
  event.paths.some(
    (path) => !path.includes("/tests/") && !drained.some((sink) => path.startsWith(sink)),
  );

const boot = () => {
  const runtime = {
    process: new Deno.Command(Deno.execPath(), { args: ["run", "-A", "run.js"] }).spawn(),
    left: false,
  };
  runtime.process.status.then((status) => {
    runtime.left = true;
    console.log(`runtime left · code ${status.code}`);
  });
  return runtime;
};

let runtime = boot();
let settling = null;
let restarted = Promise.resolve();

for (const signal of ["SIGINT", "SIGTERM"]) {
  Deno.addSignalListener(signal, async () => {
    if (!runtime.left) runtime.process.kill(signal);
    await runtime.process.status;
    Deno.exit(0);
  });
}

for await (const event of Deno.watchFs(watched)) {
  if (!saved(event)) continue;
  clearTimeout(settling);
  settling = setTimeout(() => {
    restarted = restarted.then(async () => {
      console.log(`Watcher Restarting! File change detected: ${JSON.stringify(event.paths[0])}`);
      if (!runtime.left) runtime.process.kill("SIGTERM");
      await runtime.process.status;
      runtime = boot();
    });
  }, 200);
}
