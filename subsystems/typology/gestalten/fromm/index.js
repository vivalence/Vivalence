import { not } from "../not/index.js";
import * as cast from "../cast/index.js";
import * as is from "../is/index.js";
import { Path } from "../../prototypes/path.js";

export * from "./yield.js";

export const sink = (target) => {
  return {
    get write() {
      if (is.fn(target)) return target;
      if (target?.send) return (value) => target.send(value);
      if (target?.enqueue) return (value) => target.enqueue(value);
      if (target?.set) return (value) => target.set(value);
      if (target?.getWriter) {
        const writer = target.getWriter();
        const encoder = new TextEncoder();
        return (value) => writer.write(typeof value === "string" ? encoder.encode(value) : value);
      }
      throw not.is("sink", target);
    },
  };
};

export const source = (origin) => {
  return {
    get read() {
      if (origin?.[Symbol.asyncIterator]) return origin; // ReadableStream, Queue, generator
      if (origin?.observe) return origin.observe(); // Pipe
      if (Array.isArray(origin)) return (async function* () { yield* origin; })();
      throw not.is("source", origin);
    },
  };
};

export const url = (thing) => {
  if (!is.url(thing)) throw not.is("url", thing);
  const url = cast.url(thing);
  return {
    get path() {
      const [file, ...dir] = url.absolute
        .replace(/^file:\/\//, "")
        .split("/")
        .reverse();

      return new Path(file) //
        .from(new Path(dir.reverse().join("/")));
    },
  };
};

export const match = (steps) => {
  return {
    get parameters() {
      return steps
        .filter((step) => !!step.parameter)
        .reduce((acc, step) => ({ ...acc, ...step.parameters }), {});
    },
  };
};

export const params = (params) => {
  return {
    get path() {
      const segments = [];
      while (params[segments.length] !== undefined) segments.push(params[segments.length]);
      if (!segments.length) return new Path("/");
      const path = new Path(segments);
      return path.fin ?? path;
    },
  };
};

export const modes = (modes) => {
  return {
    get flat() {
      return Object.values(modes).flatMap((type) => Object.values(type));
    },
  };
};

export const slugmap = (slugmap) => {
  return {
    get array() {
      return Object.entries(slugmap) //
        .map(([slug, map]) => ({ slug, ...map }));
    },
  };
};
export { controller } from "./controller.js";
