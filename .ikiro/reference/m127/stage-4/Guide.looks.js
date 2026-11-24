  const noted = $derived(local.picker && local.picker !== true ? local.picker.note : null);
  const pictured = $derived(noted === null ? (ins?.images ?? []) : (ins?.notes[noted]?.images ?? []));
  const titled = (id) => parts[bySlug[id]?.ref]?.name ?? parts[id]?.name ?? id;
  const looks = $derived.by(() => {
    const entries = (ins?.staged?.placements ?? []).map((one) => ({
      ...one,
      name: titled(one.literal),
      summary: [one.status, one.colour, one.label && "label", one.translation && "moved"].filter(Boolean).join(" · "),
    }));
    const shared = entries.find((one) => one.literal === local.sel[0]) ?? {};
    const seat = bySlug[local.sel[0]]?.translation ?? [0, 0, 0];
    return { entries, shared, seat, selected: local.sel };
  });
