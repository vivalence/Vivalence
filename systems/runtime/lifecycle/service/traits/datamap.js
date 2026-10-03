import paladin from "@vivalence/paladin";
import { Vector, shard, shape } from "@vivalence/typology";
import { assemble, sets } from "../../../entities/index.ts";

export const DATAMAP = async (service, mask) => {
  const provider = await paladin.ledger.registry.accio(mask.datamap.module);
  const instance = assemble([mask.entities ?? sets.lighthouse]);
  service.datamap = await provider.provider(mask.datamap, {
    entities: instance.entities.map((descriptor) => descriptor.schema),
    subscribers: instance.subscribers.map((Subscriber) => new Subscriber()),
  });
  service.entities = service.datamap.entities;
  service.twitch = new Vector();
  service.twitch.branch("/after").use(shard.datamap.detached(service.datamap));
  service.datamap.registerSubscriber(shape.subscriber(service.twitch));
  service.attachment.use(shard.datamap.inject(service.datamap));
  return { terminate: () => service.datamap.close() };
};
