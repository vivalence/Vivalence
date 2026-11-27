export const scope = (paladin) => {
  const scopes = new Map();

  paladin.scopes = (declarations) => {
    declarations.forEach(([name, condition, resolver]) => {
      if (scopes.has(name)) console.warn("paladin.scope overwrite");
      if (name === "ledger") delete paladin.ledger.held;
      scopes.set(name, [condition, resolver]);
    });
  };

  paladin.scope = new Proxy(
    {},
    {
      get: (_, key) => {
        const [condition, resolver] = scopes.get(key) ?? [];
        return condition?.() ? resolver?.() : undefined;
      },

      has: (_, key) => {
        const [condition] = scopes.get(key) ?? [];
        return condition?.() ?? false;
      },

      ownKeys: () => {
        return Array.from(scopes.keys()).filter((key) => {
          const [condition] = scopes.get(key) ?? [];
          return condition?.();
        });
      },
      getOwnPropertyDescriptor: (_, key) => {
        const [condition] = scopes.get(key) ?? [];
        if (condition?.()) {
          return { enumerable: true, configurable: true };
        }
      },
    },
  );
};
