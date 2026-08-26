export default function publish(paladin) {
  paladin.publish = () => {
    // get(), not vars: vars is raw so doctor can show source text, but a published value crosses
    // into a process that cannot expand it.
    for (const key of Object.keys(paladin.env.vars)) {
      if (key.startsWith("PUBLIC_")) Deno.env.set(key, paladin.env.get(key));
    }
  };
}
