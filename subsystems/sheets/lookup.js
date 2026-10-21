export const lookup = (table, name, kind) => {
  if (!Object.hasOwn(table, name)) throw new Error(`[sheets] not a ${kind}: ${JSON.stringify(name)} · ${Object.keys(table).join(" · ")}`);
  return table[name];
};
