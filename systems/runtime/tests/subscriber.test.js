import { specimen, sleep, Vector, shard, shape } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { LiteralEntity } from "@vivalence/runtime";

let scenario, twitch, seen, stamped;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  twitch = new Vector();
  twitch.branch("/after").use(shard.datamap.detached(scenario));
  scenario.em.getEventManager().registerSubscriber(shape.subscriber(twitch));
});

specimen.afterAll(async () => await scenario.orm.close());

specimen.beforeEach(() => ((seen = []), (stamped = [])));

specimen.describe("the before lane — inline, against the live entity", () => {
  specimen.it("mutates the entity being flushed, and never touches the detached queue", async () => {
    twitch.open("/before/literal/create", (ctx) => {
      stamped.push(ctx.input.entity.slug);
      if (ctx.input.entity.slug === "before-lane") ctx.input.entity.trait = { STAMPED: true };
    });

    const literal = scenario.em.create(LiteralEntity, { slug: "before-lane", trait: {}, symbol: {} });
    await scenario.em.flush();

    specimen.expect(stamped).toEqual(["before-lane"]);
    specimen.expect(seen).toEqual([]);
    specimen.expect(literal.trait.STAMPED).toBe(true);
  });
});

specimen.describe("the after lane — deferred by middleware, not by the subscriber", () => {
  specimen.it("never blocks the flush that triggered it — the subscriber's await returns first", async () => {
    const order = [];
    twitch.open("/after/literal/update", (ctx) => {
      order.push("handler");
      seen.push(ctx.input.entity.slug);
    });

    const literal = scenario.em.create(LiteralEntity, { slug: "after-lane", trait: {}, symbol: {} });
    await scenario.em.flush();

    literal.trait = { TOUCHED: true };
    const flushing = scenario.em.flush();
    order.push("flush-called");
    await flushing;

    specimen.expect(order[0]).toBe("flush-called");

    await sleep.ms(10);
    specimen.expect(seen).toEqual(["after-lane"]);
  });

  specimen.it("hands the handler the LIVE args, because INTENTED forks the em off them", async () => {
    const captured = [];
    twitch.open("/after/literal/create", (ctx) => captured.push(ctx.input));

    scenario.em.create(LiteralEntity, { slug: "live-args", trait: { A: 1 }, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(10);

    const event = captured.find((each) => each.entity.slug === "live-args");
    specimen.expect(event.entity instanceof LiteralEntity).toBe(true);
    specimen.expect(typeof event.em.fork).toBe("function");
  });

  specimen.it("keeps the ORM filter params, so reactive's owner stamp needs no input sniffing", async () => {
    const owners = [];
    twitch.open("/after/literal/create", () => {
      owners.push(scenario.repos.literal.getEntityManager().getFilterParams("user")?.user ?? null);
    });

    scenario.em.create(LiteralEntity, { slug: "owned", trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(10);

    specimen.expect(owners[0]).toBe(scenario.fixtures.user.id);
  });

  specimen.it("queries in the carried scope, so a drain handler may read the database it was woken by", async () => {
    const counted = [];
    twitch.open("/after/literal/create", async () => {
      counted.push(await scenario.repos.literal.count({}));
    });

    scenario.em.create(LiteralEntity, { slug: "reentrant-read", trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(20);

    specimen.expect(counted.length).toBe(1);
    specimen.expect(counted[0]).toBeGreaterThan(0);
  });
});

specimen.describe("the pump — one queue, poison-resistant", () => {
  specimen.it("keeps ordering and survives a handler that throws mid-queue", async () => {
    twitch.open("/after/literal/create", (ctx) => {
      if (ctx.input.entity.slug === "boom") throw new Error("boom");
      seen.push(ctx.input.entity.slug);
    });

    for (const slug of ["one", "boom", "two"])
      scenario.em.create(LiteralEntity, { slug, trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(20);

    specimen.expect(stamped).toEqual(["one", "boom", "two"]);
    specimen.expect(seen).toEqual(["one", "two"]);
  });
});
