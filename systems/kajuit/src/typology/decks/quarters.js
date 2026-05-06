import { Vector, shape, shard } from "@vivalence/typology";
import { TerminalDossier } from "../entities/terminal.js";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

export class Quarters {
  constructor() {
    const dossier = TerminalDossier;
    const repository = dossier.repository(dossier, this);

    const vector = new Vector()
      .use(shard.context.attach("dossier", dossier))
      .use(shard.context.attach("repository", repository))
      .use(shard.context.attach("quarters", this));
    for (const fn of dossier.use ?? []) vector.use(fn);
    vector.affect(async () => {});
    repository.integrate = shape.selbstbestimmt(vector, strategy);

    this.terminals = repository;
    this.terminals.restore().catch(console.error);
  }
}
