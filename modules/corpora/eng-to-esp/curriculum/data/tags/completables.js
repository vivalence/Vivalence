export default [
  {
    pos: {
      "pos:num": { traits: ["COMPLETABLE"] },
      "pos:adj": { traits: ["COMPLETABLE"] },
      "pos:noun": { traits: ["COMPLETABLE"] },
    },
  },
].reduce((acc, obj) => {
  Object.values(obj)
    .map(Object.entries)
    .flat()
    .map(([slug, tag]) => {
      acc.push({ slug, ...tag });
    });
  return acc;
}, []);
