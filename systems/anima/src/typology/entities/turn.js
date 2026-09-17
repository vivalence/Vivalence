import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Turn extends Entity {
  role = null;
  parts = [];
  meta = null;
  thread = null;
  mode = null;
  parent = null;
}

export const TurnDossier = {
  name: "turn",
  kind: () => Turn,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/turn"));
    return repo;
  },

  use: [],
};
