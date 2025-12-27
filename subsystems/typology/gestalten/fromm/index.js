import { not, cast, is, prototypes } from "@vivalence/typology";

// valence `const path = fromm.url(thing).path`
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

export const match = (match) => {
  // const params = cast?.params?.(thing) || thing;
  // console.log({ match });
  // console.log(JSON.stringify({ match }, null, 2));
  return {
    get parameters() {
      return match
        .filter((step) => !!step.parameter)
        .reduce((acc, step) => ({ ...acc, ...step.parameters }), {});
      // return null;

      //
      // const path = new prototypes.Path(); while (params[path.depth]) {path.stick(params[path.depth]);} return path.heir.pop();
    },
  };
};

export const params = (params) => {
  // const params = cast?.params?.(thing) || thing;
  // ?
  return {
    get path() {
      const path = new prototypes.Path();
      while (params[path.depth]) {
        path.stick(params[path.depth]);
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
