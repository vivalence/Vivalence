import userManagement from "./user-management/index.js";
import runtimeManagement from "./runtime-management/index.js";

export default async function modules(params) {
  for (const module of [userManagement, runtimeManagement]) {
    params = (await module(params)) || params;
  }
  return params;
}
