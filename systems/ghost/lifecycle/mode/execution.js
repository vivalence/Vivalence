import { Vector, traits } from "@vivalence/typology";

const stagger = async (die, next) => {
  const { mode, daemon } = die;
  mode.finalizers = await traits.stagger(mode, daemon, die.traits);
  for (const finalize of mode.finalizers) await finalize();
  die.releases = "terminators" in mode ? mode.terminators : [];
  await next();
};

export const execution = new Vector().use(stagger).do((die) => die.releases);
