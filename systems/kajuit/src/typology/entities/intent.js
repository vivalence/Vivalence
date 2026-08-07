import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const IntentDossier = {
  name: "intent",
  kind: () => Intent,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/intent"));
    return repo;
  },

  use: [],
};
