// Cortex population phase
// Resolves hallucinator services → collects faculties → Cortex(faculties) → daemon.cortex

import { Cortex } from "../typology/cortex.js";

// In the real daemon lifecycle, services are resolved via paladin.vip.
// Here we take an array of provider functions directly.

export async function populateCortex(daemon, providers) {
  const faculties = [];

  for (const provider of providers) {
    const serviceFaculties = await provider(daemon.services ?? {});
    faculties.push(...serviceFaculties);
  }

  daemon.cortex = Cortex(faculties);
  return daemon.cortex;
}
