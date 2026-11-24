export const publish = (paladin) => {
  paladin.publish = () => {
    for (const key of Object.keys(paladin.env.vars)) {
      const value = key.startsWith("PUBLIC_") ? paladin.env.get(key) : undefined;
      if (value !== undefined && value !== null) Deno.env.set(key, String(value));
    }
  };
};
