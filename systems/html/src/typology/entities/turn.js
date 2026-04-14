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
  remote: { endpoint: "/userspace/entities/turn" },

  use: [],
};
