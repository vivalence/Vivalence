const Monad = {
  of: (x) => ({
    // Core operations
    chain: (f) => f(x),
    map: (f) => Monad.of(f(x)),

    run: () => x,

    // Additional utilities
    tap: (f) => {
      f(x);
      return Monad.of(x);
    },

    // Handle potential null/undefined
    maybe: (f) => (x != null ? Monad.of(f(x)) : Monad.of(null)),

    // Conditional branching
    when: (pred, f) => (pred(x) ? Monad.of(f(x)) : Monad.of(x)),
    unless: (pred, f) => (!pred(x) ? Monad.of(f(x)) : Monad.of(x)),

    // Error handling
    catchError: (f) => {
      try {
        return Monad.of(x);
      } catch (e) {
        return Monad.of(f(e, x));
      }
    },

    // Async support
    asyncMap: async (f) => Monad.of(await f(x)),
    asyncChain: async (f) => await f(x),

    // Debugging
    inspect: (message = "Value") => {
      console.log(`${message}:`, x);
      return Monad.of(x);
    },

    // Convert to array, string, etc
    toArray: () => (Array.isArray(x) ? x : [x]),
    toString: () => String(x),
    toJSON: () => JSON.stringify(x),

    // Get underlying value with default
    getOrElse: (defaultValue) => x ?? defaultValue,

    // Transform with multiple functions
    ap: (fs) => Monad.of(fs.map((f) => f(x))),
  }),
};

Monad.all = (ms) => Monad.of(ms.map((m) => m.run()));
Monad.empty = () => Monad.of(null);
Monad.fromNullable = (x) => (x != null ? Monad.of(x) : Monad.empty());
Monad.fromPromise = (promise) => Monad.of(promise).asyncChain((x) => Monad.of(x));

export default Monad;

// const example = () => {
//   // Debugging
//   Monad.of(5)
//     .map((x) => x * 2)
//     .inspect("After multiplication")
//     .run();

//   // Error handling with recovery
//   Monad.of(() => {
//     throw new Error("boom");
//   })
//     .catchError((err, val) => "recovered")
//     .run();

//   // Conditional transformation
//   Monad.of(7)
//     .when(
//       (x) => x > 5,
//       (x) => x * 2,
//     )
//     .unless(
//       (x) => x > 20,
//       (x) => x + 1,
//     )
//     .run();

//   // Side effects without breaking chain
//   Monad.of("data")
//     .tap(console.log)
//     .map((x) => x.toUpperCase())
//     .run();

//   // Async operations
//   Monad.of(fetch("https://api.example.com"))
//     .asyncChain((response) => response.json())
//     .asyncMap((data) => processData(data))
//     .run();

//   // Multiple transformations
//   Monad.of(5)
//     .ap([(x) => x * 2, (x) => x + 3, (x) => x ** 2])
//     .run();
// };
