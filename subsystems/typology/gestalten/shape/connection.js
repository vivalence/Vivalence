// wire a stripped pattern ({ leaves, branches }, from shape.strip) onto a connection
// as a tree of callers. leaf → connection.aim("/<nature>"); branch → recurse on
// connection.branch("/<segment>") so sub-branches inherit the wrapped transport.
export function wire(connection, stripped) {
  const api = {};
  for (const leaf of stripped?.leaves ?? []) api[leaf.nature] = connection.aim(`/${leaf.nature}`);
  for (const [segment, sub] of Object.entries(stripped?.branches ?? {}))
    api[segment] = wire(connection.branch(`/${segment}`), sub);
  return api;
}
