const collate = (tiers) => {
  const slots = {};
  for (const tier of tiers) {
    for (const descriptor of Object.values(tier)) {
      const slot = (slots[descriptor.type] ??= { type: descriptor.type, twitches: new Set() });
      slot.entity = descriptor.entity ?? slot.entity;
      slot.schema = descriptor.schema ?? slot.schema;
      slot.repository = descriptor.repository ?? slot.repository;
      if (descriptor.twitch) slot.twitches.add(descriptor.twitch);
    }
  }
  return Object.values(slots);
};

export function assemble(tiers) {
  const instance = collate(tiers);
  return {
    entities: instance.map(({ twitches, ...entity }) => entity),
    twitch: [...new Set(instance.flatMap((slot) => [...slot.twitches]))],
  };
}
