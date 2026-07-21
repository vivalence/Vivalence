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
  Url, Connection, Mode, Path, Aperture, Vector,
  shard, shape, is, array,
} from "@vivalence/typology";
import { sets, UserEntity, BufferEntity, LiteralEntity, SymbolEntity } from "@vivalence/typology/entities";
import { provider as memoryDatamap } from "@vivalence/typology/scenarios";
import { assemble } from "./fixtures.js";
import { Daemon } from "@vivalence/runtime/daemon";
import * as traits from "../../daemon/traits/index.js";
import * as lifecycleResolution from "../../daemon/lifecycle/resolution.js";
import * as lifecyclePopulation from "../../daemon/lifecycle/population.js";
import * as apertureSetup from "../../daemon/aperture/index.js";

// ── test APPLICATION ──────────────────────────────────────────────────
// Same as real APPLICATION but skips the svelte bundler (no esbuild).
const BENCH_APPLICATION = async (mode, daemon) => {
  mode.app.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.app.fill(desc),
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
        await paladin.vip.supply();
        paladinMounted = true;
      }
      resolved.push(await paladin.vip.accio(item));
    } else {
      // Raw imports are frozen Module namespace objects.
      // Wrap in a plain object so population.modes can set .mount etc.
      const wrapped = { ...item };
      if (!wrapped.mount) {
        // Synthetic mount path — population.modes uses this to resolve
        // buffer.path relative to the .viva.js directory. Without a real
        // filesystem path, use the slug from manifest.
        const slug = wrapped.manifest?.slug ?? "unknown";
        const type = wrapped.manifest?.type ?? "mode";
        wrapped.mount = new Path(`/bench/${type}/${slug}`);
      }
      resolved.push(wrapped);
    }
  }
  return resolved;
}

// ── bench ──────────────────────────────────────────────────────────
export async function bench(spec = {}) {
  const kernel = await resolve(spec.kernel || []);

  const domain = kernel.find((module) => module.manifest?.type === "domain");

  const variantTraits = {
    ...traits,
    ...(domain?.traits || {}),
    APPLICATION: BENCH_APPLICATION,
  };

  const { entities: variantEntities, subscribers: variantSubscribers } = assemble([
    sets.daemon,
    sets.kernel,
    sets.userspace,
    domain?.entities || {},
  ]);

  const datamapInstance = await memoryDatamap(variantEntities, variantSubscribers);

  // ── assemble daemon ──────────────────────────────────────────────
  const daemon = new Daemon({
    manifest: { type: "daemon", slug: "bench", version: "0.0.1", traits: [] },
  });
  daemon.mount = new Path("/daemon/bench");
  daemon.url = new Url("http://bench/daemon/bench");
  daemon.attach = new Url("http://bench/attached");
  daemon.entities = datamapInstance.entities;

  const subscriber = shape.subscriber(daemon.twitch);
  datamapInstance.subscribe(subscriber);

  // ── seed a test user (before services, so default auth can reference it) ──
  const user = datamapInstance.entities.em.create(UserEntity, { roles: ["USER"], config: {} });
  await datamapInstance.entities.em.flush();
  datamapInstance.entities.em.setFilterParams("user", { user: user.id });

  // ── build die shape that lifecycle functions expect ───────────────
  const die = {
    good: daemon,
    mask: { manifest: daemon.manifest },
    datamap: datamapInstance,
    domain,
    variant: {
      traits: variantTraits,
      entities: variantEntities,
      subscribers: variantSubscribers,
      services: {},
    },
    register: {
      kernel,
    },
    connection: null,
    status: { reflection: { code: "ALIVE" }, set: () => {} },
    slug: "bench",
    manifest: daemon.manifest,
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
  await lifecyclePopulation.modes(die);
  lifecyclePopulation.handlers(die);

  // ── resolve (trait application + aperture wiring) ────────────────
  if (domain?.aperture) {
    domain.aperture.use(shard.context.bind("daemon", daemon));
    daemon.aperture.slurp(domain.aperture);
  }

  await lifecycleResolution.modes(die);

  // ── aperture routes ──────────────────────────────────────────────
  await apertureSetup.datamap(die);
  if (services.lighthouse) await apertureSetup.userspace(die);
  await apertureSetup.modes(die);
  await apertureSetup.freight(die);

  // ── connection ───────────────────────────────────────────────────
  const handler = shape.http(daemon.aperture);
  const connection = new Connection(new Url("http://bench"), shard.transmitter.inline(handler));
  daemon.connection = connection;

  // ── DATASET trait: seed ontology/corpus entities ─────────────────
  for (const mode of daemon.flatmodes()) {
    if (mode.implements("DATASET") && mode.module.dataset?.entities) {
      await seedDataset(mode.module.dataset.entities, datamapInstance.entities);
    }
  }

  return {
    daemon,
    die,
    orm: datamapInstance.orm,
    em: datamapInstance.entities.em,
    connection,
    user,
    async teardown() {
      await datamapInstance.disintegrate();
    },
  };
}

// ── dataset seeding ────────────────────────────────────────────────
// TODO: This is where the DATASET trait's upsert logic belongs.
// The real trait (daemon/traits/dataset.js) does batched upserts with
// linkPhase for symbol↔literal M:N relations and updatedAt tracking.
//
// For now, implement the minimal version: iterate entities.literal[]
// and entities.symbol[], call repo.ensure() for each.
//
// Consider: should this call the real DATASET trait function, or is a
// simplified version better for test determinism?

async function seedDataset(datasetEntities, entities) {
  if (datasetEntities.symbol) {
    for (const symbolData of datasetEntities.symbol) {
      await entities.symbol.ensure(symbolData);
    }
  }
  if (datasetEntities.literal) {
    for (const literalData of datasetEntities.literal) {
      await entities.literal.ensure(literalData);
    }
  }
  await entities.em.flush();
}
