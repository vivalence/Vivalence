import type { Static, TObject, TProperties } from "typebox";
import type { contexts } from "../schematics/index.js";
import type { Controller } from "./controller.js";
import type { Cortex } from "./cortex.js";
import type { Datamap } from "./datamap.js";
import type { Path } from "./path.js";
import type { Pattern } from "./pattern.js";
import type { Pool } from "./pool.js";
import type { Request } from "./request.js";
import type { Response } from "./response.js";
import type { Signal } from "./signal.js";
import type { Span } from "./span.js";
import type { Url } from "./url.js";
import type { Vector } from "./vector.js";

export interface Live {
  request: Request;
  response: Response;
  signal: Signal;
  steps: Pattern[];
  controller: Controller;
  reference: Path;
  attach: Url;
  datamap: Datamap;
  cortex: Cortex;
  pool: Pool;
  span: Span;
  tools: Vector;
  shell: Vector;
}

export type Die<Keys extends TProperties> = {
  [Key in keyof Static<TObject<Keys>>]: Key extends keyof Live ? Live[Key] : Static<TObject<Keys>>[Key];
};

export interface Loose extends Die<typeof contexts.vector> {
  [key: string]: any;
}
