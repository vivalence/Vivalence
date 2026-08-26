import { shape, shard, steer, Cargo } from "@vivalence/typology";
import { stagger } from "../traits/index.js";
import { stamp } from "../traits/dataset.js";

export async function domain(daemonDie) {
  daemonDie.good.aperture
    .use(shard.secure.authorize())
    .use(daemonDie.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));

  if (daemonDie.good.domain.aperture) {
    daemonDie.good.domain.aperture.use(shard.context.bind("daemon", daemonDie.good));
    daemonDie.good.aperture.slurp(daemonDie.good.domain.aperture);
    daemonDie.good.call = shape.proxy(daemonDie.good.domain.aperture, steer.strategy.direct);
  }

  // domain wires its own userspace entities (trace/retention, …); slim daemon has no domain → no-op
  await daemonDie.good.domain.resolve?.(daemonDie);
}

export async function freight(daemonDie) {
  const good = daemonDie.good;
  const fraught = () =>
    good
      .flatmodes()
      .filter((mode) => mode.implements("FRAUGHT"))
      .map((mode) => mode.freight);

  good.cargo = new Cargo(fraught);

  const seen = new Set();
  for (const freight of fraught()) {
    for (const key of Object.keys(freight.catalog)) {
      if (seen.has(key)) console.warn(`[FREIGHT] slug collision: "${key}"`);
      seen.add(key);
    }
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    const finalizers = [];
    for (const mode of daemonDie.good.flatmodes()) {
      mode.aperture
        .use(shard.context.bind("daemon", daemonDie.good))
        .use(shard.context.bind("mode", mode))
        .open("/status", (_, ctx) => ctx.mode.status.reflection)
        .open("/manifest", (_, ctx) => ctx.mode.manifest);

      if (mode.module.aperture) mode.aperture.slurp(mode.module.aperture);

      const held = mode.entity.installed;
      const fresh = await stamp(mode);
      if (typeof held === "string" && held && held !== fresh) {
        console.log(
          `[DATASET] ${mode.type}/${mode.slug} dataset files differ from the installed stamp — reinstalling`,
        );
        mode.entity.installed = "";
      }

      finalizers.push(...(await stagger(mode, daemonDie.good, daemonDie.instance.traits)));

      if (mode.module.aperture && !mode.implements("EXPOSED")) {
        console.warn(`[trait] ${mode.type}/${mode.slug} exports aperture without EXPOSED`);
      }
      if (mode.module.datasink && !mode.implements("DATASINK")) {
        console.warn(`[trait] ${mode.type}/${mode.slug} exports datasink without DATASINK`);
      }

      mode.entity.installed = fresh;
      await daemonDie.good.entities.mode.nativeUpdate({ id: mode.entity.id }, { installed: fresh });
    }

    await Promise.all(finalizers.map((finalize) => finalize()));

    for (const mode of daemonDie.good.flatmodes()) {
      daemonDie.good.aperture
        .branch(mode.mount.nature)
        .use(shard.secure.authorize())
        .slurp(mode.aperture);
    }
  });
}
