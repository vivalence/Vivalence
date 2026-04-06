import { not, cast, is, prototypes } from "@vivalence/typology";

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
      const path = new prototypes.Path();
      while (params[path.depth]) {
        path.yeet(params[path.depth]);
      }
      return path.heir.pop();
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
