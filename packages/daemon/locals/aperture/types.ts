import { Context as OakContext, RouterContext } from "oak";

export interface ApertureContext extends RouterContext {
  aperture: {
    body?: any;
    result?: any;
  };
}

export type Handler = (body: any, ctx: ApertureContext) => Promise<any> | any;

export interface RouteHandler {
  path: string;
  handler: Handler;
}

export interface ApertureOptions {
  basePath?: string;
}
