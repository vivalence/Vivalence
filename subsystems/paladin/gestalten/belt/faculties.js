const merge = (mask, declared, tiers) => {
  const own = declared.flatMap((held) => held.faculties);
  const restated = (faculty) => own.some((held) => held.id === faculty.id);
  const kept = mask.faculties.filter((faculty) => !tiers.has(faculty.tier) && !restated(faculty));
  const inherited = (id) => mask.faculties.find((faculty) => faculty.id === id);
  const added = own.map((faculty) => ({ ...inherited(faculty.id), ...faculty }));
  return Object.assign({}, mask, ...declared, { faculties: [...kept, ...added] });
};

export function extend(below, above) {
  const tiers = new Set(below.flatMap((mask) => mask.faculties).flatMap((faculty) => faculty.tier ?? []));
  const named = (module) => below.filter((mask) => mask.module === module);
  const fresh = below.filter((mask) => !above.some((held) => held.module === mask.module));
  return [...above.map((mask) => merge(mask, named(mask.module), tiers)), ...fresh];
}
