// // base example:
//   const vector = new Vector([sig]);
//   vector
//     .branch("/search")
//     .branch("/:query")
//     .open("/results", () => "search results");

//   const getSignal = (patterns) => {
//     const hasSearch = patterns.some((p) => p.signature === "search");
//     const hasQuery = patterns.some(
//       (p) => p.signature && p.signature.startsWith(":"),
//     );
//     const hasResults = patterns.some((p) => p.signature === "results");

//     if (hasSearch) return Promise.resolve(sig.signal("/search"));
//     if (hasQuery) return Promise.resolve(sig.signal("/javascript"));
//     if (hasResults) return Promise.resolve(sig.signal("/results"));

//     return Promise.resolve([]);
//   };

//   const [effect, bundle, finalVector, steps] = await walk(vector, getSignal);

// second example
// export async function twitch(rme) {
//   const subscriptions = entities.on.patterns
//     .map((p) => p.signature)
//     .map((s) => data.map[s].entity);

//   const subscriber = new compiler.Subscriber(
//     subscriptions,
//     async (signal, event) => {
//       try {
//         const [effect, apply] = controller //
//           .traverse(entities.on, signal);
//         const context = { event, };
//         await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
//       } catch (error) {
//         if (!["NOT_FOUND", "LONG", "SHORT"].includes(error.code)) throw error;
//       }
//     },
//   );
