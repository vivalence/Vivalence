import Aperture from "./aperture.ts";
import Path from "./path.ts";
import { ApertureOptions } from "./types.ts";

export { Aperture, Path };

export function create(options: ApertureOptions = {}) {
  const path = options.path ? new Path(options.path) : new Path();
  return new Aperture(path);
}

export function context(path, body, params) {
  return {
    state: {},
    request: {
      body,
      url: new URL(path, "http://internal"),
      method: params.method || "POST",
      headers: new Headers(),
    },
    response: { body: {}, status: null, headers: new Headers() },
  };
}

export default { create, context };
