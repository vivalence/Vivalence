import { isAbsolute, resolve } from "@std/path";

const TYPOLOGY = "/subsystems/typology/";
const PATHLIKE = new RegExp("^\\.{0,2}/");

export const pure = {
  name: "pure",
  setup(build) {
    build.onResolve({ filter: PATHLIKE }, (args) => {
      const path = isAbsolute(args.path) ? args.path : resolve(args.resolveDir, args.path);
      return path.includes(TYPOLOGY) ? { path, sideEffects: false } : undefined;
    });
  },
};
