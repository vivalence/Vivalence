const slug = (held) => held?.manifest?.slug ?? held?.module ?? "?";
const module = (held) => held?.module ?? held?.manifest?.slug ?? "?";
const many = (list, say) => (list?.length ? list.map(say).join(" · ") : "none");

const VOICE = {
  environment: (held) => `${Object.keys(held?.properties ?? {}).length} keys`,
  runtime: slug,
  datamap: module,
  hallucinators: (held) => many(held, module),
  clients: (held) => many(held, slug),
  services: (held) => many(held, slug),
};

export const say = (slot, held) => (VOICE[slot] ?? module)(held);

export const spoken = (declaration, slots) =>
  Object.fromEntries(slots.filter((slot) => declaration?.[slot] !== undefined).map((slot) => [slot, say(slot, declaration[slot])]));
