import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Literal extends Entity {}

export const LiteralDossier = {
  name: "literal",
  kind: () => Literal,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/entities/literal"));
    return repo;
  },
};
