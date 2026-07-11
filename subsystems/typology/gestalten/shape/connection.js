export function wire(connection, stripped) {
  const api = {};
  for (const [segment, sub] of Object.entries(stripped?.branches ?? {}))
    api[segment] = wire(connection.branch(`/${segment}`), sub);
  for (const leaf of stripped?.leaves ?? []) {
    const caller = connection.aim(`/${leaf.nature}`);
    if (api[leaf.nature]) Object.assign(caller, api[leaf.nature]);
    api[leaf.nature] = caller;
  }
  return api;
}
