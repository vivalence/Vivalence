export default function publish(paladin) {
  paladin.publish = () => {
    for (const [key, value] of Object.entries(paladin.env.vars)) {
      if (key.startsWith("PUBLIC_")) Deno.env.set(key, value);
    }
  };
}
