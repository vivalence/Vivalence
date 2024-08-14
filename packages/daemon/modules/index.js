import userManagement from "./user-management/index.js";

export default async function modules(params) {
  for (const module of [userManagement]) {
    params = module(params);
  }
  return params;
}
