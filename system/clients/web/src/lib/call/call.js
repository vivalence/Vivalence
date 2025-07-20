import compose from "./compose.js";
import vfetch from "./fetch.js";
import context from "./context.js";

export function Call(basePath = "", createContext = context, middlewares = []) {
  const instance = async (endpoint, body = {}, params = {}) => {
    const url = new URL(basePath + endpoint).toString();
    const composed = compose(middlewares);

    const ctx = createContext();
    ctx.request = { ...ctx.request, url, body, ...params };

    ctx.request.retry = async () => {
      ctx.state.isRetry = true;
      ctx.response.body = await instance(endpoint, body, params);
    };

    await composed(ctx, vfetch);

    return ctx.response.body;
  };

  instance.branch = (path) => {
    return new Call(basePath + path, createContext, [...middlewares]);
  };

  instance.use = (middleware) => {
    middlewares.push(middleware);
    return instance;
  };

  instance.call = instance;

  return instance;
}

export default Call;
