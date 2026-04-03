import { Url, Connection, shard, shape } from "@vivalence/typology";

export async function call(die) {
  const handler = shape.http(die.good.aperture);
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(handler));
}

export async function prune(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    const em = daemonDie.good.entities.em;

    // {const keys = new Set(daemonDie.good.flatmodes().map((m) => m.manifest.type + ":" + m.manifest.slug),); const existing = await daemonDie.good.entities.mode.find(); for (const mode of existing) {if (keys.has(mode.type + ":" + mode.slug)) continue; em.remove(mode); console.log("PRUNED mode:", mode.slug);} await em.flush();}

    // {for (const mode of daemonDie.good.flatmodes()) {const slugs = new Set((mode.cake.dataset?.intent || []).map((i) => i.slug)); const existing = await daemonDie.good.entities.intent.find({ mode: mode.entity.id }); for (const intent of existing) {if (slugs.has(intent.slug)) continue; em.remove(intent); console.log("PRUNED intent:", intent.slug);}} await em.flush();}

    // {const slugs = new Set(daemonDie.good .flatmodes() .flatMap((m) => (m.cake.dataset?.entities?.symbol || []).map((s) => s.slug)),); const existing = await daemonDie.good.entities.symbol.find(); for (const symbol of existing) {if (slugs.has(symbol.slug)) continue; em.remove(symbol); console.log("PRUNED symbol:", symbol.slug);} await em.flush();} // removes computed symbols!

    // {const slugs = new Set(daemonDie.good .flatmodes() .flatMap((m) => (m.cake.dataset?.entities?.literal || []).map((l) => l.slug)),); const existing = await daemonDie.good.entities.literal.find(); for (const literal of existing) {if (slugs.has(literal.slug)) continue; em.remove(literal); console.log("PRUNED literal:", literal.slug);} await em.flush();}
  });
}
