// ── bench ───────────────────────────────────────────────────────────
// Test-grade daemon factory. Boots a real daemon from registry modules
// using the actual lifecycle pipeline, but with in-memory sqlite and
// stubbed infrastructure.
//
// Accepts raw imported modules OR paladin specifier strings.
//
//   await bench({
//     kernel: [
//       "@education/domain/language-learning",
//       "@education/ontology/word",
//       "@education/game/flashcard",
//     ],
//   })
//
//   await bench({
//     kernel: [domainModule, ontologyModule, flashcardModule],
//     services: {
//       lighthouse: { authenticate: async (token) => ({ getUser: async () => user }) },
//       hallucinator: { object: async () => ({}), action: async () => ({}) },
//       consume: { nlp: { analyze: async (text) => ({ tokens: [] }) } },
//     },
//   })

import paladin from "@vivalence/paladin";
import {
  Url, Connection, Mode, Path, Aperture, Vector, Controller, Span, middleware,
  shard, shape, is, array,
} from "@vivalence/typology";
import { Daemon, lifecycle, sets, ActivityEntity, ActivityRepository, UserEntity, BufferEntity, LiteralEntity, SymbolEntity } from "@vivalence/runtime";
import { provider as memoryDatamap } from "./datamap.js";
import { assemble } from "./fixtures.js";

// ── test APPLICATION ──────────────────────────────────────────────────
// Same as real APPLICATION but skips the svelte bundler (no esbuild).
const BENCH_APPLICATION = async (mode, daemon) => {
  mode.application.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.application.fill(desc),
      view: null,
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(await daemon.entities.literal.findByIdentifiers(desc.literals));
    if (desc.symbols) buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(desc.symbols));
    return buffer;
  };
};

let paladinMounted = false;

// ── resolve ────────────────────────────────────────────────────────
// Turn a mixed array of strings + raw modules into resolved modules.
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
      // Raw imports are frozen Module namespace objects.
      // Wrap in a plain object so population.modes can set .reference etc.
      const wrapped = { ...item };
      if (!wrapped.source) {
        // Synthetic source path — the traits resolve buffer.path relative to the .viva.js directory.
        // Without a real filesystem path, use the slug from manifest.
        const slug = wrapped.manifest?.slug ?? "unknown";
        const type = wrapped.manifest?.type ?? "mode";
        wrapped.source = new Path(`/bench/${type}/${slug}`);
      }
      resolved.push(wrapped);
    }
  }
  // the seats paladin would have minted: reference · url · bundles under the bench daemon
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

// ── bench ──────────────────────────────────────────────────────────
export async function bench(spec = {}) {
  const kernel = await resolve(spec.kernel || []);

  const domain = kernel.find((module) => module.manifest?.type === "domain");

  const instanceTraits = {
    ...lifecycle.mode.traits,
    ...(domain?.traits || {}),
    APPLICATION: BENCH_APPLICATION,
  };

  const { entities: instanceEntities, subscribers: instanceSubscribers } = assemble([
    sets.kernel,
    sets.userspace,
    sets.transient,
    domain?.entities || {},
  ]);

  const datamapInstance = await memoryDatamap(instanceEntities, instanceSubscribers);

  // ── assemble daemon ──────────────────────────────────────────────
  const daemon = Object.assign(new Daemon(), {
    mask: {
      manifest: { type: "daemon", slug: "bench", version: "0.0.1", traits: [] },
      reference: new Path("/daemon/bench"),
      url: new Url("http://bench/daemon/bench"),
      attach: new Url("http://bench/attached"),
    },
  });
  daemon.entities = datamapInstance.entities;
  daemon.entities.activity = new ActivityRepository(datamapInstance.orm.em, ActivityEntity);
  daemon.datamap = datamapInstance;

  const subscriber = shape.subscriber(daemon.twitch);
  datamapInstance.registerSubscriber(subscriber);

  // ── seed a test user (before services, so default auth can reference it) ──
  const user = datamapInstance.entities.em.create(UserEntity, { roles: ["USER"], config: {} });
  await datamapInstance.entities.em.flush();
  datamapInstance.entities.em.setFilterParams("user", { user: user.id });

  // ── build die shape that lifecycle functions expect ───────────────
  const die = {
    controller: new Controller({ stdout: new Span("bench") }),
    daemon,
    mask: { manifest: daemon.manifest },
    instance: {
      traits: instanceTraits,
      entities: instanceEntities,
      subscribers: instanceSubscribers,
      services: {},
    },
    register: {
      kernel,
    },
  };

  // ── services ──────────────────────────────────────────────────────
  // lighthouse → daemon.lighthouse (auth provider for shard.secure.authority)
  // hallucinator → daemon.hallucinator (AI provider for HARNESSED trait)
  // consume → daemon.services[slug] (external services like NLP)
  const services = spec.services || {};

  if (services.lighthouse) {
    daemon.lighthouse = services.lighthouse;
    daemon.aperture.use(shard.secure.authority(daemon.lighthouse));
  } else {
    // Default: permissive auth that accepts any token
    daemon.aperture.use(async (ctx, next) => {
      ctx.authority = {
        authenticate: async () => ({ getUser: async () => user }),
      };
      await next();
    });
  }

  if (services.hallucinator) {
    daemon.hallucinator = services.hallucinator;
  }

  if (services.consume) {
    for (const [slug, service] of Object.entries(services.consume)) {
      daemon.services[slug] = service;
    }
  }

  // ── populate modes (reuse real lifecycle) ─────────────────────────
  daemon.aperture.use(shard.datamap.inject(datamapInstance));

  // ── resolve (trait application + aperture wiring) ────────────────
  if (domain?.aperture) {
    domain.aperture.use(shard.context.bind("daemon", daemon));
    daemon.aperture.slurp(domain.aperture);
  }

  const ready = Promise.withResolvers();
  const release = Promise.withResolvers();
  const execution = middleware.compose([
    lifecycle.daemon.population.modes,
    lifecycle.daemon.resolution.modes(lifecycle.mode.execution),
    lifecycle.daemon.aperture.datamap,
    ...(services.lighthouse ? [lifecycle.daemon.aperture.userspace] : []),
    lifecycle.daemon.aperture.modes,
    lifecycle.daemon.aperture.freight,
  ])(die, () => {
    ready.resolve();
    return release.promise;
  });
  await Promise.race([ready.promise, execution]);

  // ── connection ───────────────────────────────────────────────────
  const handler = shape.http(daemon.aperture);
  const connection = new Connection(new Url("http://bench"), shard.transmitter.inline(handler));
  daemon.connection = connection;

  // ── DATASET trait: seed ontology/corpus entities ─────────────────
  for (const mode of daemon.flatmodes())
    if (mode.implements("DATASET")) await lifecycle.mode.traits.DATASET(mode, daemon);

  return {
    daemon,
    die,
    orm: datamapInstance.orm,
    em: datamapInstance.entities.em,
    connection,
    user,
    async teardown() {
      release.resolve();
      await execution;
      await datamapInstance.close();
    },
  };
}

