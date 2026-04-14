import { Entity } from "../prototypes/entity.js";

export class Literal extends Entity {}

export const LiteralDossier = {
  name: "literal",
  kind: () => Literal,
  remote: { endpoint: "/entities/literal" },
};
