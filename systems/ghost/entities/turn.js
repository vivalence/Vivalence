import { Entity, RemoteRepository, Vector } from "@vivalence/typology";

export class Turn extends Entity {
  role = null;
  parts = [];
  meta = null;
  thread = null;
  mode = null;
  parent = null;
}

export const repository = (dataspace) => new RemoteRepository(Turn).connect(dataspace.runtime.connection.branch("/userspace/entities/turn"));

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  if (ctx.entity.thread.controller !== null) ctx.entity.thread.controller.stdout.mark("turn", ctx.entity);
});
