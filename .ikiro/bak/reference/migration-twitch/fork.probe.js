// an em forked at the twitch root, beside the em the subscriber forks per dispatch today: are they the same thing to an effect?
// arg: <a fresh mountpoint dir>
import { Path, shard, Twitch } from "@vivalence/typology";
import { sets, UserEntity } from "@vivalence/typology/entities";
import { provider } from "../../../commons/datamaps/libsql/libsql.viva.js";

const tiers = [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient];
const descriptors = [...new Set(tiers.flatMap((tier) => Object.values(tier)))];

const datamap = await provider(
  { mountpoint: new Path(Deno.args[0]), statics: { db: { file: "fork.viva.db" } } },
  { entities: descriptors.map((descriptor) => descriptor.schema) },
);

const forked = (held) => (ctx, next) => {
  ctx.em = held.entities.em.fork({ keepTransactionContext: true });
  return next();
};

const seen = [];
const compare = (phase) => async (ctx) => {
  const given = ctx.input.em;
  seen.push({
    phase,
    "same transaction": ctx.em.getTransactionContext() === given.getTransactionContext(),
    "in a transaction": [ctx.em.isInTransaction(), given.isInTransaction()],
    "user filter": [ctx.em.getFilterParams("user"), given.getFilterParams("user")],
    "sees the new user": phase === "before" ? "unasked" : [
      Boolean(await ctx.em.findOne(UserEntity, ctx.input.entity.id, { filters: false })),
      Boolean(await given.findOne(UserEntity, ctx.input.entity.id, { filters: false })),
    ],
  });
};

const twitch = new Twitch().use(forked(datamap));
twitch.branch("/after").use(shard.datamap.detached(datamap));
for (const held of new Set(descriptors.map((descriptor) => descriptor.twitch).filter(Boolean))) twitch.graft(held);
twitch.open("/before/user/create", compare("before"));
twitch.open("/after/user/create", compare("after"));
datamap.registerSubscriber(twitch);

await datamap.shard.scope(async () => {
  datamap.entities.em.setFilterParams("user", { user: "probe" });
  datamap.entities.user.create({ slug: "probe", authentication: { credentials: { username: "probe" } } });
  await datamap.entities.em.flush();
});
await new Promise((resolve) => setTimeout(resolve, 500));

console.log(JSON.stringify(seen, null, 2));
const terminals = await datamap.orm.em.getConnection().execute("select count(*) as terminals from `Terminal`");
console.log("terminals minted by the user's own effect:", terminals[0].terminals);
await datamap.close();
