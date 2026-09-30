import { RequestContext } from "@mikro-orm/core";

export class Datamap {
  constructor(orm) {
    this.orm = orm;
    this.entities = { em: orm.em };
    for (const meta of Object.values(orm.getMetadata().getAll())) {
      if (meta.abstract || meta.pivotTable || meta.embeddable) continue;
      this.entities[meta.className.toLowerCase().replace("entity", "")] = orm.em.getRepository(meta.class);
    }
    this.shard = {
      scope: (task) => RequestContext.create(orm.em, task),
      bind: (name, resolve) => async (ctx, next) => {
        RequestContext.getEntityManager(orm.em.name)?.setFilterParams(name, resolve(ctx));
        await next();
      },
      carry: () => {
        const context = RequestContext.currentRequestContext();
        return (task) => (context ? RequestContext.storage.run(context, task) : task());
      },
    };
  }

  getMetadata() {
    return this.orm.getMetadata();
  }

  registerSubscriber(subscriber) {
    this.orm.em.getEventManager().registerSubscriber(subscriber);
  }

  close() {
    return this.orm.close();
  }
}
