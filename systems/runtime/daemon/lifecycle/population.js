import paladin from "@vivalence/paladin";
import { wrap } from "@mikro-orm/core";

import { Mode, Url, Path, Aperture, Cortex, shard } from "@vivalence/typology";
import { is, array, shape, steer } from "@vivalence/typology";
import { sets } from "@vivalence/typology/entities";

import * as kernel from "../kernel.js";
import * as traits from "../traits/index.js";

export async function core(die) {
  const registry = {
    lighthouse: die.mask.lighthouse,
    hallucinator: die.mask.hallucinator,
    datamap: die.mask.datamap,
    kernel: die.mask.kernel,
    modes: die.mask.modes,
    consume: die.mask.consume,
  };
  // if (die.mask.speech)   registry.speech   = die.mask.speech;
  // if (die.mask.verbatim) registry.verbatim = die.mask.verbatim;

  die.register = await paladin.vip.accioMap(registry);

  die.kernel = {
    domain: die.register.kernel.find((m) => m.manifest.type === "domain"),
    corpus: die.register.kernel.filter((m) => m.manifest.type === "corpus"),
    ontology: die.register.kernel.filter((m) => m.manifest.type === "ontology"),
  };

  die.variant.traits = {
    ...kernel.traits,
    ...traits,
    ...(die.kernel.domain.traits || {}),
  };

  die.variant.modes = [...kernel.modes, ...(die.kernel.domain.modes || [])];

  die.variant.entities = [
    ...sets.daemon,
    ...sets.kernel,
    ...sets.userspace,
    ...die.kernel.domain.entities,
  ];
}

export function wiring(daemonDie) {
  daemonDie.good.statics = daemonDie.mask.statics;
  daemonDie.good.docs = daemonDie.mask.docs;
}

export async function datamap(daemonDie) {
  daemonDie.datamap = await daemonDie.register.datamap.provider(
    daemonDie.mask.datamap,
    daemonDie.variant.entities,
  );

  daemonDie.good.entities = daemonDie.datamap.entities;
  daemonDie.good.datamap = daemonDie.datamap;

  daemonDie.datamap.subscribe(shape.subscriber(daemonDie.good.twitch));
  daemonDie.good.aperture.use(shard.datamap.inject(daemonDie.datamap));
}

export async function authority(daemonDie) {
  daemonDie.good.lighthouse = await daemonDie.register.lighthouse //
    .provider(daemonDie.mask.lighthouse, daemonDie.good.entities.user);

  daemonDie.good.aperture //
    .use(shard.secure.authority(daemonDie.good.lighthouse))
    .use(async (ctx, next) => {
      ctx.daemon.connection = daemonDie.connection.clone();
      ctx.daemon.connection //
        .use(async (context, next) => {
          context.request.headers.set("authorization", ctx.request.headers.get("authorization"));
          await next();
        });
      ctx.daemon.call = ctx.daemon.connection.call.bind(ctx.daemon.connection);
      await next();
    });
}

export async function acid(daemonDie) {
  daemonDie.good.hallucinator = await daemonDie.register.hallucinator //
    .provider(daemonDie.mask.hallucinator);

  const faculties = daemonDie.good.hallucinator;

  if (faculties?.[Symbol.iterator]) {
    daemonDie.good.cortex = new Cortex().extend(faculties);
  }

  // if (daemonDie.register.speech && daemonDie.mask.speech) {
  //   const speechFaculties = await daemonDie.register.speech.provider(daemonDie.mask.speech);
  //   if (speechFaculties?.[Symbol.iterator]) {
  //     daemonDie.good.cortex ??= new Cortex();
  //     daemonDie.good.cortex.extend(speechFaculties);
  //   }
  // }

  // if (daemonDie.register.verbatim && daemonDie.mask.verbatim) {
  //   const verbatimFaculties = await daemonDie.register.verbatim.provider(daemonDie.mask.verbatim);
  //   if (verbatimFaculties?.[Symbol.iterator]) {
  //     daemonDie.good.cortex ??= new Cortex();
  //     daemonDie.good.cortex.extend(verbatimFaculties);
  //   }
  // }
}

export async function services(daemonDie) {
  for (const [slug, servicemask] of Object.entries(daemonDie.mask.consume)) {
    const servicecake = daemonDie.register.consume[slug];
    daemonDie.good.services[slug] = await servicecake.provider(servicemask);
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    const registeredModes = [...daemonDie.register.kernel, ...daemonDie.register.modes]
      .map((register) => {
        const variant = daemonDie.variant.modes //
          .find((v) => register.manifest.type === v.type);

        if (variant) return { variant, register };

        console.log(`@runtime/daemon/population/modes(${register.type})`);
        console.log("variant not found during mode construction");
        console.log({ register });
      })
      .filter(Boolean);

    for (const { register, variant } of registeredModes) {
      const mode = new variant.prototype(register);
      mode.mount = daemonDie.good.mount.clone().branch(`/mode/${mode.type}/${mode.slug}`);
      mode.url = daemonDie.good.url.branch(mode.mount.nature);

      if (!mode.aperture) mode.aperture = new Aperture();

      if (mode.implements("BUFFERED")) {
        mode.cake.buffer.path.from(new Path(mode.cake.mount.dirname));

        const url = daemonDie.good.attach
          .branch("/view")
          .branch(mode.mount.absolute)
          .branch(mode.cake.buffer.path.nature);

        mode.cake.buffer.withUrl(url);
      }

      if (mode.implements("FRAUGHT")) {
        mode.cake.freight.path.from(new Path(mode.cake.mount.dirname));
        const url = daemonDie.good.attach.branch("/cargo").branch(daemonDie.good.mount.nature);
        mode.cake.freight.withUrl(url);
      }

      mode.entity = await daemonDie.good.entities.mode //
        .ensure(mode.manifest);

      mode.entity.traits = array //
        .unique([...mode.entity.traits, ...mode.traits]);

      await daemonDie.good.entities.em.flush();

      mode.entity = wrap(mode.entity).toPOJO();
      mode.id = mode.entity.id;

      if (!daemonDie.good.modes[mode.type]) daemonDie.good.modes[mode.type] = {};
      daemonDie.good.modes[mode.type][mode.slug] = mode;
    }
  });
}

export function handlers(daemonDie) {
  daemonDie.good.flatmodes = () =>
    Object.values(daemonDie.good.modes)
      .map((type) => Object.values(type))
      .flat();
}
