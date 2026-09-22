// what a declaration SAYS in a slot, one line each — the doctors' voice for a ledger's word and for
// what an instance inherited. a slot names its module(s) or its slug(s); environment counts keys.
const slug = (held) => held?.manifest?.slug ?? held?.module ?? "?";
const module = (held) => held?.module ?? held?.manifest?.slug ?? "?";
const many = (list, say) => (list?.length ? list.map(say).join(" · ") : "none");

const VOICE = {
  environment: (held) => `${Object.keys(held?.properties ?? {}).length} keys`,
  runtime: slug,
  lighthouse: module,
  datamap: module,
  hallucinators: (held) => many(held, module),
  clients: (held) => many(held, slug),
  services: (held) => many(held, slug),
};

export const say = (slot, held) => (VOICE[slot] ?? module)(held);

// { slot: line } for every slot the declaration speaks, in the schematic's order
export const spoken = (declaration, slots) =>
  Object.fromEntries(slots.filter((slot) => declaration?.[slot] !== undefined).map((slot) => [slot, say(slot, declaration[slot])]));
