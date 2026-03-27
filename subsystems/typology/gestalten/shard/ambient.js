import { AsyncLocalStorage } from "node:async_hooks";
import { object } from "@vivalence/typology";

const ambient = new AsyncLocalStorage();

export const store = (resolve) => async (ctx, next) => {
  await ambient.run(resolve(ctx), next);
};

export const combine = (fn) => async (ctx, next) => {
  const parent = ambient.getStore();
  if (parent) fn(ctx, parent);
  await next();
};

export const assign = (fn) => async (ctx, next) => {
  const parent = ambient.getStore();
  if (parent) object.assign(ctx, fn(parent));
  await next();
};

export const current = () => ambient.getStore();
