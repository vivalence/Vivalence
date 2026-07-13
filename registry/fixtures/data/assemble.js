import { EntitySchema } from "@mikro-orm/core";
import { DataRepository } from "@vivalence/typology/entities";

const collate = (tiers) => {
  const slots = {};
  for (const tier of tiers)
    for (const descriptor of Object.values(tier)) {
      const slot = (slots[descriptor.type] ??= { type: descriptor.type, subscribers: new Set() });
      slot.entity = descriptor.entity ?? slot.entity;
      slot.schema = descriptor.schema ?? slot.schema;
      slot.repository = descriptor.repository ?? slot.repository;
      if (descriptor.subscriber) slot.subscribers.add(descriptor.subscriber);
    }
  return Object.values(slots);
};

const seal = (slot) =>
  !slot.schema.meta.abstract
    ? slot
    : {
        ...slot,
        schema: new EntitySchema({
          class: slot.entity,
          extends: slot.schema,
          name: slot.schema.meta.className,
          tableName: slot.schema.meta.className,
          repository: () => slot.repository ?? DataRepository,
        }),
      };

export function assemble(tiers) {
  const variant = collate(tiers).map(seal);
  return {
    entities: variant.map(({ subscribers, ...entity }) => entity),
    subscribers: [...new Set(variant.flatMap((slot) => [...slot.subscribers]))],
  };
}
