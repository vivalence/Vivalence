import { Entity } from "./entity.js";
import { atom } from "nanostores";

export class Thread extends Entity {
  user = null;
  mode = null;
  intent = null;
  phase = "stream";
  traits = [];
  trait = {};
  buffers = [];
  turns = [];
  counter = 0;
  cursor = 0;
  queue = null;
  $buffer = atom(null);
}
