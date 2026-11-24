import { v } from "@vivalence/typology";
import { Selector } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/primitives/hallucination.js";

const Conversational = v.object({
  language: v.array(v.string()).default([]),
  hear: v.object({ ...Selector }).default({}),
  speak: v.object({ ...Selector }).default({}),
  call: v.object({ ...Selector }).default({}),
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v
    .object({
      ...Selector,
      engaged: v.boolean().default(true).optional(),
    })
    .default({}),
});

const heal = (stored) => Conversational.cast(Conversational.repair(Conversational.cast(structuredClone(stored))));
const policy = (trait) => {
  const { engaged, ...selector } = trait.polish;
  return engaged ? { tier: "fast", ...selector, rounds: 1 } : null;
};
const print = (label, value) => console.log(`--- ${label}\n${JSON.stringify(value, null, 2)}`);

const fresh = Conversational.cast({});
print("fresh thread, cast", fresh);
print("fresh thread, faults", Conversational.faults(fresh));
print("fresh thread, repair policy", policy(fresh));

const stored = { language: ["it"], hear: { provider: "elevenlabs" }, polish: false };
print("stored before the change", stored);
print("stored, healed", heal(stored));
print("stored, healed, faults", Conversational.faults(heal(stored)));

const picked = Conversational.cast({ language: ["it"], polish: { id: "google/gemini-3.5-flash-lite", engaged: false } });
print("picked and off, cast", picked);
print("picked and off, repair policy", policy(picked));
print("picked and on, repair policy", policy({ ...picked, polish: { ...picked.polish, engaged: true } }));
