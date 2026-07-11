import { specimen, shard } from "@vivalence/typology";
import { AsyncLocalStorage } from "node:async_hooks";

// datamap.inject re-wraps a lazy streaming response body so each pull re-enters the request's
// context (the ORM RequestContext). It is GATED on datamap.shard.carry — a provider that omits
// carry silently no-ops, and any em-touching stream (e.g. the harness persisting turns on
// /turn/close) then runs OUTSIDE the context → global-EM / stranded-parent errors. This pins the
// contract so a provider can't lose carry again without a red test.

function datamapWith({ carry }) {
  const als = new AsyncLocalStorage();
  const shardObject = {
    context: (fn) => als.run({ live: true }, fn),
    ...(carry && {
      carry: () => {
        const store = als.getStore();
        return (fn) => als.run(store, fn);
      },
    }),
  };
  return { entities: {}, shard: shardObject, als };
}

// a body that reads the ambient context per item — models the persist generator touching the em.
async function* touching(als, seen) {
  for (let index = 0; index < 3; index++) {
    seen.push(als.getStore()?.live ?? null); // null = ran outside the request context
    yield index;
  }
}

async function drive({ carry }) {
  const datamap = datamapWith({ carry });
  const seen = [];
  const ctx = { response: { body: null } };
  await shard.datamap.inject(datamap)(ctx, async () => {
    ctx.response.body = touching(datamap.als, seen);
  });
  for await (const _ of ctx.response.body) void _;
  return seen;
}

specimen.describe("datamap.inject carries the request context into a streaming body", () => {
  specimen.it("without shard.carry → stream runs OUTSIDE the context", async () => {
    specimen.expect(await drive({ carry: false })).toEqual([null, null, null]);
  });

  specimen.it("with shard.carry → each pull re-enters the captured context", async () => {
    specimen.expect(await drive({ carry: true })).toEqual([true, true, true]);
  });
});
