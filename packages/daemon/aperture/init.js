import config from "@vivalence/config";
import Aperture from "../locals/aperture/index.ts";
import v1 from "./v1/index.js";

export default async (daemon) => {
  daemon.aperture = Aperture.create();

  daemon.aperture.use(contextMiddleware(daemon));

  v1(daemon.aperture.branch("/aperture/v1/daemon"));

  return daemon;
};

const contextMiddleware = (daemon) => async (ctx, next) => {
  ctx.daemon = daemon;
  await next();
};
const formatRequestContextMiddleware = async (ctx, next) => {
  // translate oak context to aperturecontext;
  await next();
  // and back;
};
