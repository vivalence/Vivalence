import { RequestContext } from "@mikro-orm/core";
import * as shape from "../gestalten/shape/index.js";
import * as datamap from "../gestalten/shard/datamap.js";

export class Datamap {
  migrated = [];

  constructor(orm) {
    this.orm = orm;
    this.entities = { em: orm.em };
    for (const meta of orm.getMetadata().getAll().values()) {
      if (meta.abstract || meta.pivotTable || meta.embeddable) continue;
      this.entities[meta.className.toLowerCase().replace("entity", "")] = orm.em.getRepository(meta.class);
    }
    this.shard = {
      scope: (task) => RequestContext.create(orm.em, task),
      bind: (name, resolve) => datamap.bind(orm.em, name, resolve),
      carry: () => {
        const context = RequestContext.currentRequestContext();
        return (task) => (context ? RequestContext.storage.run(context, task) : task());
      },
    };
  }

  getMetadata() {
    return this.orm.getMetadata();
  }

  registerSubscriber(twitch) {
    const scope = {
      before: (em, task) => RequestContext.create(em, task, { keepTransactionContext: true }),
      after: (em, task) => RequestContext.create(em, task),
    };
    twitch.use(datamap.forked(this));
    this.orm.em.getEventManager().registerSubscriber(shape.subscriber(twitch, { scope }));
  }

  close() {
    return this.orm.close();
  }
}
