const traverse = async (obj, arrow) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => [key, await arrow(key, value)]),
    ),
  );

const accio = async (query) => ({ module: query.module, provider: "function" });
const consume = { reader: { module: "@probe/service/reader" }, engine: { module: "@probe/service/stockfish" } };

console.log(JSON.stringify(await traverse(consume, (slug, query) => accio(query)), null, 2));
console.log(JSON.stringify(await traverse({}, (slug, query) => accio(query))));
