import paladin from "@vivalence/paladin";
import { Connection, contexts, Controller, fromm, middleware, Path, shape, shard, Span, Twitch, Url } from "@vivalence/typology";
import { Daemon, lifecycle, sets, kernel, gestalten, ActivityEntity, ActivityRepository, UserEntity, DaemonEntity, BufferEntity, traits as catalog } from "@vivalence/runtime";
import { assemble } from "../../gestalten/belt/assemble.js";
import { provider as memoryDatamap, stack } from "./datamap.js";
import { connector, lighthouseOf } from "./daemon.js";

const { gather, mint, strike } = gestalten.belt;

const BENCH_APPLICATION = async (mode, daemon) => {
  mode.application.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.application.fill(desc),
      bundle: null,
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(await daemon.entities.literal.findByIdentifiers(desc.literals));
    if (desc.symbols) buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(desc.symbols));
    return buffer;
  };
};

let paladinMounted = false;

async function resolve(items) {
  if (!items?.length) return [];
  const resolved = [];
  for (const item of items) {
    if (typeof item === "string") {
      if (!paladinMounted) {
        await paladin.ledger.registry.supply();
        paladinMounted = true;
      }
      resolved.push(await paladin.ledger.registry.accio(item));
    } else {
      const wrapped = { ...item };
      if (!wrapped.source) {
        const slug = wrapped.manifest?.slug ?? "unknown";
        const type = wrapped.manifest?.type ?? "mode";
        wrapped.source = new Path(`/bench/${type}/${slug}`);
      }
      resolved.push(wrapped);
    }
  }
  return resolved.map((citizen) => {
    const { type, slug } = citizen.manifest;
    return {
      ...citizen,
      reference: citizen.reference ?? new Path(`/mode/${type}/${slug}`),
      url: citizen.url ?? new Url(`http://bench/daemon/bench/mode/${type}/${slug}`),
      bundles: citizen.bundles ?? new Path(`/bench/bundles/${type}/${slug}`),
    };
  });
}

export async function bench(spec = {}) {
  const modules = await resolve(spec.modes || []);
  const domain = modules.find((module) => module.manifest?.type === "domain");

  const instanceTraits = { ...catalog.mode, APPLICATION: BENCH_APPLICATION };

  const { entities: descriptors, twitch: twitches } = assemble(stack);
  const datamapInstance = await memoryDatamap(descriptors);
  const em = datamapInstance.entities.em;
  const runtimeTwitch = new Twitch();
  for (const held of twitches) runtimeTwitch.graft(held);
  runtimeTwitch.branch("/after").use(shard.datamap.detached(datamapInstance));
  datamapInstance.registerSubscriber(runtimeTwitch);

  const daemon = Object.assign(new Daemon(), {
    slug: "bench",
    mask: {
      manifest: { type: "daemon", slug: "bench", version: "0.0.1", traits: [] },
      reference: new Path("/daemon/bench"),
      url: new Url("http://bench/daemon/bench"),
      attach: new Url("http://bench/attached"),
    },
  });
  const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(kernel, domain, modules, kind)]));
  daemon.minted = mint({ slug: "bench", kinds: sets.traits, traits });
  daemon.entities = { ...datamapInstance.entities, ...strike(daemon.minted, em, sets.traits), activity: new ActivityRepository(em, ActivityEntity) };
  daemon.datamap = datamapInstance;
  daemon.twitch = new Twitch().use(shard.context.spread(contexts.host, daemon)).use(shard.datamap.owned());
  daemon.twitch.branch("/after").use(shard.datamap.detached(datamapInstance));
  if (domain?.twitch) daemon.twitch.graft(domain.twitch);
  datamapInstance.registerSubscriber(daemon.twitch);

  em.create(DaemonEntity, { slug: "bench", mask: daemon.mask.manifest });
  const user = em.create(UserEntity, { slug: "bench" });
  await em.flush();
  em.setFilterParams("user", { user: user.id });

  const die = {
    controller: new Controller({ stdout: new Span("bench") }),
    daemon,
    mask: { manifest: daemon.manifest },
    traits: instanceTraits,
    instance: { traits: instanceTraits, services: {} },
    register: { modes: modules },
  };

  daemon.controller = die.controller;

  const services = spec.services || {};
  if (services.hallucinator) daemon.hallucinator = services.hallucinator;
  if (services.consume) {
    for (const [slug, service] of Object.entries(services.consume)) daemon.services[slug] = service;
  }

  const lighthouse = lighthouseOf(datamapInstance, datamapInstance.entities.user);
  daemon.aperture.use(shard.datamap.inject(datamapInstance)).use(lighthouse.authenticate).use(lighthouse.bind);

  if (domain?.aperture) {
    domain.aperture.use(shard.context.spread(contexts.host, daemon));
    daemon.aperture.graft(domain.aperture);
  }

  const ready = Promise.withResolvers();
  const release = Promise.withResolvers();
  const execution = middleware.compose([
    lifecycle.daemon.population.modes,
    lifecycle.daemon.resolution.modes(lifecycle.mode.execution),
    lifecycle.daemon.integration.datamap,
    lifecycle.daemon.integration.entities,
    lifecycle.daemon.integration.freight,
  ])(die, () => {
    ready.resolve();
    return release.promise;
  });
  await Promise.race([ready.promise, execution]);

  const handler = shape.http(daemon.aperture);
  const connect = connector(handler);
  const connection = await connect(user);
  daemon.connection = connection;

  for (const mode of fromm.modes(daemon.modes).flat)
    if (mode.implements("DATASET")) await catalog.mode.DATASET(mode, daemon);

  return {
    daemon,
    die,
    lighthouse,
    orm: datamapInstance.orm,
    em,
    connection,
    connect,
    user,
    async teardown() {
      release.resolve();
      await execution;
      await datamapInstance.close();
    },
  };
}
