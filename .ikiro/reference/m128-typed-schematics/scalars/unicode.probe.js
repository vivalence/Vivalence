import { v } from "@vivalence/typology";

const part = "[\\p{L}\\p{N}]+(?:[-_][\\p{L}\\p{N}]+)*";
const wide = v.string({ pattern: `^${part}(?:\\.${part})*$` });
for (const held of ["chess", "abajo.adverb", "puzzle-0000D", "opening.eco.A00", "a_b", "retention.azúcar.noun", "你好.noun", "a..b", "a b", "a/b", ""])
  console.log(JSON.stringify(held), wide.check(held));
