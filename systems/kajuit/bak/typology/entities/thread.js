import { Entity } from "./entity.js";

export class Thread extends Entity {
  mode = null;
  intent = null;
  cursor = 0;
  counter = 0;
  traits = [];
  trait = {};
}
