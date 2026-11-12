// limit: 3500 chars
const seen = [];
const timed = async (label, run) => {
  const started = performance.now();
  const value = await run();
  seen.push({ label, ms: Math.round(performance.now() - started) });
  return value;
};

const { default: paladin, factories } = await timed("import paladin", () => import("@vivalence/paladin"));
const typology = await timed("import typology", () => import("@vivalence/typology"));
const { sets } = await timed("import typology/entities", () => import("@vivalence/typology/entities"));
await timed("import runtime factory", () => import("../../../systems/runtime/subjects/runtime/factory.js"));
const { assemble } = await import("../../../systems/runtime/gestalten/belt/index.js");

await timed("factories.instance", () => factories.instance(paladin.instance));
await timed("registry.supply", () => paladin.ledger.registry.supply());
const datamapMode = await timed("accio datamap", () => paladin.ledger.registry.accio("@commons/datamap/libsql"));

const directory = await Deno.makeTempDir({ prefix: "boot-timing-beats-" });
const slug = paladin.instance.manifest.slug;
try {
  await Deno.copyFile(`${paladin.scope.mountpoint.absolute}/${slug}.viva.db`, `${directory}/${slug}.viva.db`);
  await Deno.mkdir(`${directory}/migrations`);
  for await (const held of Deno.readDir(`${paladin.scope.mountpoint.absolute}/migrations`))
    await Deno.copyFile(`${paladin.scope.mountpoint.absolute}/migrations/${held.name}`, `${directory}/migrations/${held.name}`);
  const { entities } = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
  const { MikroORM } = await import("@mikro-orm/sqlite");
  const options = { entities: entities.map((descriptor) => descriptor.schema) };
  const mount = { mountpoint: new typology.Path(directory), statics: { db: { file: `${slug}.viva.db` } } };
  const orm = await timed("datamap · MikroORM.init", () => MikroORM.init(datamapMode.config(mount, options)));
  const drifted = await timed("datamap · migrator.checkSchema", () => orm.migrator.checkSchema());
  const pending = await timed("datamap · migrator.getPending", () => orm.migrator.getPending());
  seen.push({ label: `  drifted=${drifted} pending=${pending.length}`, ms: 0 });
  await orm.close();

  const citizens = await timed("acid · accio hallucinators", () =>
    Promise.all((paladin.instance.hallucinators ?? []).map((query) => paladin.ledger.registry.accio(query))),
  );
  for (const citizen of citizens)
    await timed(`acid · provider ${citizen.manifest.slug}`, () => citizen.provider(citizen).catch((error) => error.message));
  await timed("accio services", () =>
    Promise.all(paladin.instance.services.map((query) => paladin.ledger.registry.accio(query))),
  );
  console.table(seen);
} finally {
  await Deno.remove(directory, { recursive: true });
  Deno.exit(0);
}
