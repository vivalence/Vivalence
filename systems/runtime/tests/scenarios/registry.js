import paladin from "@vivalence/paladin";

// cross-package modules resolve through the REGISTRY, never a relative path. @education is a
// tapped package now — it lives wherever the ledger records, which is not inside this repo.
// supply() folds the whole record once; every later accio is a pensieve read.
let supplied = null;

export async function accio(identifier) {
  supplied ??= paladin.ledger.registry.supply();
  await supplied;
  return await paladin.ledger.registry.accio(identifier);
}
