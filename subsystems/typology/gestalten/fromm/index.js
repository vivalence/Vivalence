import { not, cast, is, prototypes } from "@vivalence/typology";

// valence `const path = fromm.url(thing).path`
export const url = (thing) => {
  if (!is.url(thing)) throw not.is("url", thing);
  const url = cast.url(thing);
  return {
    get path() {
      const [file, ...dir] = url
        .replace(/^file:\/\//, "")
        .split("/")
        .reverse();

      return new prototypes.Path(file) //
        .from(new prototypes.Path(dir.reverse().join("/")));
    },
  };
};

export const params = (thing) => {
  const params = cast.params?.(thing) || thing;
  return {
    get path() {
      const path = new Path();
      while (params[path.depth]) {
        path.stick(params[path.depth]);
      }
      return path;
    },
  };
};
