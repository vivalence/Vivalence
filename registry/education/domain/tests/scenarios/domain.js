import { shard, shape, steer, Connection, Url } from "@vivalence/typology";
import { daemon as scenarios } from "@vivalence/runtime/scenarios";
import * as domain from "../../domain.viva.js";

export async function mount() {
  const scenario = await scenarios.create();
  const good = scenario.daemon;

  good.domain = domain;
  good.aperture
    .use(shard.secure.authorize())
    .use(scenario.die.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));
  domain.aperture.use(shard.context.bind("daemon", good));
  good.aperture.slurp(domain.aperture);
  good.call = shape.proxy(domain.aperture, steer.strategy.direct);
  domain.resolve(scenario.die);

  const handler = shape.http(good.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  const authedConn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  authedConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  const tools = shape.proxy(domain.tools, steer.strategy.direct);
  const invoke = (path, input, extra = {}) =>
    scenario.scoped(() => tools[path]({ input, daemon: good, user: scenario.fixtures.user, mode: null, thread: null, ...extra }));

  return { ...scenario, handler, conn, authedConn, domain, tools, invoke };
}
