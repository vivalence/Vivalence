import paladin from "@vivalence/paladin";
import { shape, v, Vector } from "@vivalence/typology";

const slots = (bag) => Object.keys(bag ?? {});

const routes = (node, at = "") =>
  Object.entries(node?.branches ?? {}).flatMap(([segment, child]) => {
    const path = `${at}/${segment}`;
    return [...(child.effect ? [path] : []), ...routes(child, path)];
  });

const declared = (held) =>
  typeof held === "string"
    ? { module: held }
    : { module: held.module ?? null, statics: held.statics ?? null };

// names and whether they resolve, never values. paladin holds the values and every caller
// here can reach it; nothing downstream of this fold needs a copy of them.
export const variables = (env = paladin.env) =>
  Object.keys(env.vars)
    .sort()
    .map((key) => ({ key, set: Boolean(env.get(key)) }));

// the standing facts, off state already in memory. NO filesystem walk: report()'s two
// ledger.list() awaits are what keeps this a separate reader and not a projection of the fold.
export const standing = (ctx) => {
  const here = ctx.daemon.mountpoint?.absolute ?? null;
  const mask =
    paladin.instance.daemons.find((held) => held.mountpoint?.absolute === here) ??
      {};
  return {
    instance: paladin.instance.manifest,
    daemon: { slug: mask.manifest?.slug ?? null, mountpoint: here },
    entities: Object.keys(ctx.daemon.entities ?? {}).filter((name) =>
      name !== "em"
    ).sort(),
    modes: ctx.daemon.flatmodes().map((mode) => ({
      slug: mode.manifest.slug,
      traits: mode.manifest.traits ?? [],
      routes: routes(shape.strip(mode.aperture)),
    })),
    faults: paladin.instance.faults,
  };
};

export const machine = ({ instance, daemon, modes, entities, faults }) =>
  [
    `instance ${instance.slug} at ${daemon.mountpoint ?? "unmounted"}`,
    `daemon ${daemon.slug ?? "unnamed"} · entities ${
      entities.length ? entities.join(" ") : "none"
    }`,
    ...modes.map(
      (mode) =>
        `mode ${mode.slug} [${mode.traits.join(" ")}] ${
          mode.routes.join(" ") || "no routes"
        }`,
    ),
    faults.length
      ? `FAULTS ${faults.map((fault) => fault.at).join(" ")}`
      : "settled",
  ].join("\n");

export const report = async (ctx) => {
  const here = ctx.daemon.mountpoint?.absolute ?? null;
  const mask =
    paladin.instance.daemons.find((held) => held.mountpoint?.absolute === here) ??
      {};
  const modes = ctx.daemon.flatmodes();

  return {
    daemon: {
      slug: mask.manifest?.slug ?? null,
      manifest: mask.manifest ?? null,
      mountpoint: here,
      statics: ctx.daemon.statics ?? {},
      lighthouse: {
        module: mask.lighthouse?.module ?? null,
        remote: paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE") ?? null,
      },
      datamap: {
        ...declared(mask.datamap ?? {}),
        entities: Object.keys(ctx.daemon.entities ?? {}).filter((name) =>
          name !== "em"
        ).sort(),
      },
      kernel: modes.map((mode) => ({
        type: mode.manifest.type,
        slug: mode.manifest.slug,
        name: mode.manifest.name ?? mode.manifest.slug,
        traits: mode.manifest.traits ?? [],
        mount: mode.mount?.nature ?? null,
        routes: routes(shape.strip(mode.aperture)),
      })),
      declaration: (mask.kernel ?? []).map(declared),
      hallucinators: (mask.hallucinators ?? []).map((held) => ({
        module: held.module,
        secrets: slots(held.secrets),
      })),
      consume: Object.entries(mask.consume ?? {}).map(([slug, held]) => ({
        slug,
        ...declared(held),
      })),
      // shape.cortex.strip reads cortex.faculties, so `?? []` hands it an array with no
      // .faculties and throws — the fallback WAS the crash. A cortexless daemon reports none.
      cortex: ctx.daemon.cortex ? shape.cortex.strip(ctx.daemon.cortex) : [],
      dormant: paladin.instance.dormant.map((at) => ({
        at,
        secrets: paladin.instance.requirements
          .filter((held) => held.at.startsWith(`${at}.`))
          .flatMap(({ at: slot, read, unset }) =>
            read.map((key) => ({
              slot: slot.slice(at.length + 1),
              key,
              unset: unset.includes(key),
            }))
          ),
      })),
      faults: paladin.instance.faults,
    },

    ledger: {
      mount: paladin.scope.ledger.absolute,
      here: paladin.scope.instance?.absolute ?? null,
      instance: paladin.instance.manifest,
      instances: await paladin.ledger.instances.list(),
      services: paladin.instance.services.map((held) => ({
        slug: held.manifest?.slug,
        module: held.module,
        secrets: slots(held.secrets),
      })),
      clients: paladin.instance.clients.map((held) => ({
        slug: held.manifest?.slug,
        traits: held.manifest?.traits ?? [],
      })),
      requirements: paladin.instance.requirements.flatMap((
        { at, read, unset },
      ) => read.map((key) => ({ at, key, unset: unset.includes(key) }))),
      environment: variables(),
    },

    registry: {
      mount: paladin.scope.registry?.absolute ?? null,
      locations: await paladin.ledger.registry.list(),
      stale: paladin.vip.stale ?? [],
      modules: [...paladin.vip.pensieve].flatMap(([owner, types]) =>
        [...types].flatMap(([type, slugs]) =>
          [...slugs].map(([slug, versions]) => {
            const [version] = [...versions.keys()];
            const module = versions.get(version);
            return {
              owner,
              type,
              slug,
              version,
              traits: module.manifest?.traits ?? [],
            };
          })
        )
      ),
    },
  };
};

// report() has two doors on it — /hello/doctor in the aperture, viva_doctor here.
export const doctor = new Vector().open(
  {
    nature: "/viva/doctor",
    valence:
      "The live vivalence setup on this machine, as JSON — the same record " +
      "`viva instance/doctor` prints, read straight off paladin. You already have the " +
      "standing facts in front of you: the instance, the daemon, the modes and their " +
      "routes. This is everything under them, in three parts. `daemon` is the one you are " +
      "running inside: its manifest, the modes its kernel resolved to with their " +
      "traits and routes, the datamap and the entities it opened, the hallucinators it " +
      "declared and which secret slots each wants, the cortex faculties actually attached, " +
      "and anything left dormant for want of a key. `ledger` is the machine's own record: " +
      "where it lives, every instance shelved on it with the one you are inside marked, " +
      "the services and clients this instance declares, every environment variable by name " +
      "and whether it resolves, and which declared slots came back unset. `registry` is " +
      "every module the system resolves, as @owner/type/slug with versions and traits — " +
      "the standard library plus whatever was tapped. Secrets live in a separate store and " +
      "never appear here; you get slot names, never a value, and for the environment names " +
      "only, never what they hold. It is a big record and it stays in this conversation " +
      "once you pull it, so pull it when a question is about this machine — and then it is " +
      "the record, not a guess.",
    input: v.object({}),
  },
  async (ctx) => ({ output: await report(ctx) }),
);
