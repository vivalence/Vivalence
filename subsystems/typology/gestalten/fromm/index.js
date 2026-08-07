import { not, cast, is, prototypes } from "@vivalence/typology";

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

      return new prototypes.Path(file) //
        .from(new prototypes.Path(dir.reverse().join("/")));
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

export const signal = (signal) => {
  return {
    get flags() {
      return signal.array.reduce(
        (acc, node) => (node.flags ? { ...acc, ...node.flags } : acc),
        {},
      );
    },
  };
};

export const params = (params) => {
  return {
    get path() {
      const segments = [];
      while (params[segments.length] !== undefined) segments.push(params[segments.length]);
      if (!segments.length) return new prototypes.Path("/");
      const path = new prototypes.Path(segments);
      return path.fin ?? path;
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
