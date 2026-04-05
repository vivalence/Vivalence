// ── bench ───────────────────────────────────────────────────────────
// Test-grade daemon factory. Boots a real daemon from registry modules
// using the actual lifecycle pipeline, but with in-memory sqlite and
// stubbed infrastructure.
//
// Accepts raw imported modules OR paladin specifier strings.
//
//   await bench({
//     kernel: ["@vivalence/domain/language-learning", "@vivalence/ontology/word"],
//     modes:  ["@vivalence/game/flashcard", "@vivalence/game/judge"],
//   })
//
//   await bench({
//     kernel: [domainModule, ontologyModule],
//     modes:  [flashcardModule],
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
import { sets, UserEntity, BufferEntity, LiteralEntity, SymbolEntity, helper } from "@vivalence/typology/entities";
import { provider as memoryDatamap } from "@vivalence/typology/scenarios";
import { Daemon } from "@vivalence/runtime/daemon";
import * as kernel from "../../daemon/kernel.js";
import * as traits from "../../daemon/traits/index.js";
import * as lifecycleResolution from "../../daemon/lifecycle/resolution.js";
import * as lifecyclePopulation from "../../daemon/lifecycle/population.js";
import * as apertureSetup from "../../daemon/aperture/index.js";

// ── test BUFFERED ──────────────────────────────────────────────────
// Same as real BUFFERED but skips the svelte bundler (no esbuild).
const BENCH_BUFFERED = async (mode, daemon) => {
  // noop bundler — bench doesn't serve compiled svelte components
  mode.cake.buffer.withBundler(() => ({ code: "", url: "" }));
  mode.aperture.open("/buffered", () => ({
    url: mode.cake.buffer.url.absolute,
    schema: mode.cake.buffer.schema,
  }));

  const ensure = (repo, ref) => helper(ref) ? ref : repo.findOne(ref?.id ?? ref);

  mode.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.cake.buffer.cast(desc),
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(await Promise.all(desc.literals.map((literal) => ensure(daemon.entities.literal, literal))));
    if (desc.symbols) buffer.symbols.add(await Promise.all(desc.symbols.map((symbol) => ensure(daemon.entities.symbol, symbol))));
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
        await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
        await paladin.vip.mount(paladin.scope.registry.branch("modes"));
        await paladin.vip.mount(paladin.scope.registry.branch("services"));
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
  const resolvedKernels = await resolve(spec.kernel || []);
  const resolvedModes = await resolve(spec.modes || []);

  // ── classify kernels ─────────────────────────────────────────────
  const domain = resolvedKernels.find((k) => k.manifest?.type === "domain");
  const ontologies = resolvedKernels.filter((k) => k.manifest?.type === "ontology");
  const topologies = resolvedKernels.filter((k) => k.manifest?.type === "topology");

  // ── variant: traits + mode prototypes + entity schemas ───────────
  const variantTraits = {
    ...kernel.traits,
    ...traits,
    ...(domain?.traits || {}),
    BUFFERED: BENCH_BUFFERED,
  };

  const variantModes = [...kernel.modes, ...(domain?.modes || [])];

  const variantEntities = [
    ...sets.daemon,
    ...sets.kernel,
    ...sets.userspace,
    ...(domain?.entities || []),
  ];

  // ── boot datamap ─────────────────────────────────────────────────
  const datamapInstance = await memoryDatamap(variantEntities);

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
    kernel: { domain, topology: topologies, ontology: ontologies },
    variant: {
      kernel: {},
      modes: variantModes,
      traits: variantTraits,
      entities: variantEntities,
      services: {},
    },
    register: {
      kernel: resolvedKernels,
      modes: resolvedModes,
    },
    connection: null,
    status: { reflection: { code: "ALIVE" }, set: () => {} },
    slug: "bench",
    manifest: daemon.manifest,
  };

  // ── services ──────────────────────────────────────────────────────
  // lighthouse → daemon.lighthouse (auth provider for shard.secure.authority)
  // hallucinator → daemon.hallucinator (AI provider for CHAOSMONKEY trait)
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
    domain.aperture.use(shard.context.attach("daemon", daemon));
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
  daemon.call = connection.call.bind(connection);

  // ── DATASET trait: seed ontology/topology entities ───────────────
  for (const mode of daemon.flatmodes()) {
    if (mode.implements("DATASET") && mode.cake.dataset?.entities) {
      await seedDataset(mode.cake.dataset.entities, datamapInstance.entities);
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
