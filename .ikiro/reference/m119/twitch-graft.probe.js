import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import { Datamap, Twitch } from "@vivalence/typology";

const Probe = new EntitySchema({
  name: "Probe",
  properties: { id: { type: "number", primary: true }, slug: { type: "string" } },
});
const orm = await MikroORM.init({ dbName: ":memory:", entities: [Probe], allowGlobalContext: true });
await orm.schema.refresh();
const datamap = new Datamap(orm);

const daemonTwitch = new Twitch();
datamap.registerSubscriber(daemonTwitch);

const fired = [];
const modeTwitch = new Twitch();
modeTwitch.open("/after/probe/create", (ctx) => {
  fired.push(ctx.input.entity.slug);
});
daemonTwitch.graft(modeTwitch);

const em = orm.em.fork();
em.create("Probe", { slug: "after-register" });
await em.flush();

console.log(JSON.stringify({
  "a mode twitch grafted after registerSubscriber fires": fired,
}, null, 2));
await orm.close();
