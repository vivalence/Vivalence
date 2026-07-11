export function wire(connection, node) {
  const api = {};
  let parameter;

  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    if (segment.startsWith(":")) { parameter = child; continue; }
    if (segment === "*" || segment === "(.*)") {
      console.warn(`[shape.connection.wire] pattern branch "${segment}" not compiled`);
      continue;
    }
    api[segment] = wire(connection.branch(`/${segment}`), child);
  }

  let result = node?.effect ? Object.assign(aim(connection, node.effect), api) : api;

  if (parameter)
    result = new Proxy(result, {
      get(target, key) {
        if (typeof key === "symbol" || key === "then" || key in target) return target[key];
        return wire(connection.branch(`/${key}`), parameter);
      },
    });

  return result;
}

function aim(connection, effect) {
  if (effect.methods && effect.methods.length > 1)
    throw new Error(
      `shape.connection.wire: method-ambiguous (${effect.methods.join(", ")}) — no transparent projection`,
    );

  const method = effect.methods?.[0];

  if (effect.yields !== undefined)
    return (input = {}, options = {}) =>
      connection.stream("", options.signal, {
        method: method ?? "POST",
        body: input,
        headers: options.headers,
      });

  return method
    ? connection.aim("", {}, { method })
    : connection.aim("");
}
