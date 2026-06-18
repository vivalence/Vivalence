import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Symbol extends Entity {}

export const SymbolDossier = {
  name: "symbol",
  kind: () => Symbol,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/entities/symbol"));
    return repo;
  },
};
