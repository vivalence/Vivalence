export default function publish(paladin) {
  paladin.publish = () => {
    // get(), not vars: vars is raw so doctor can show source text, but a published value crosses
    // into a process that cannot expand it.
    for (const key of Object.keys(paladin.env.vars)) {
      const value = key.startsWith("PUBLIC_") ? paladin.env.get(key) : undefined;
      if (value !== undefined && value !== null) Deno.env.set(key, String(value));
    }
  };
}
