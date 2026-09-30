import { is } from "@vivalence/typology";

export async function stagger(mode, daemon, traits) {
  const finalizers = [];
  for (const trait of mode.manifest.traits) {
    const result = await traits[trait]?.(mode, daemon);
    if (is.fn(result)) finalizers.push(result);
    else if (is.object(result)) {
      if (is.fn(result.finalize)) finalizers.push(result.finalize);
      if (is.fn(result.terminate)) {
        (mode.terminators ??= []).push(result.terminate);
      }
    }
  }
  return finalizers;
}
