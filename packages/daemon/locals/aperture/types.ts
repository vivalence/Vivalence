import { Context as OakContext, Middleware } from "oak";
import Path from "./path.ts";

export interface ApertureContext extends OakContext {
  aperture: {
    data?: any;
  };
}

export type Handler = (ctx: ApertureContext) => Promise<any> | any;

export interface ApertureOptions {
  path?: string | Path;
}
