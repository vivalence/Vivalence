import { Connection, Url, Path } from "@vivalence/typology";

import compose from "./compose.js";
import vfetch from "./fetch.js";
import context from "./context.js";

export function Call(basePath = "", createContext = context, carry = []) {
  if (basePath instanceof Path) basePath = basePath.absolute;

  if (basePath instanceof Connection) {
    carry = [...carry, ...basePath.carry];
    basePath = basePath.url;
  }

  const instance = async (endpoint, body = {}, params = {}) => {
    const url = new Url(basePath + endpoint).toString();
    const composed = compose(carry);

    const ctx = createContext();
    ctx.request = { ...ctx.request, url, body, ...params };

    ctx.request.retry = async () => {
      if (!ctx.state.isRetry === true) {
        ctx.state.isRetry = true;
        ctx.response.body = await instance(endpoint, body, params);
      }
    };

    await composed(ctx, vfetch);

    return ctx.response.body;
  };

  instance.branch = (path) => {
    return new Call(basePath + path, createContext, [...carry]);
  };

  instance.use = (middleware) => {
    carry.push(middleware);
    return instance;
  };

  instance.call = instance;
  instance.path = basePath;
  instance.url = basePath;

  return instance;
}

export default Call;
