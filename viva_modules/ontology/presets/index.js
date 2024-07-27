export default (runtime) => {
  const schema = runtime.schema;

  const tags = Object.entries(schema.annotations).reduce((tags, [branch, leafs]) => {
    if (branch === "lemma") return tags;
    return leafs.enum.reduce((tags, leaf) => {
      tags.push({ ontology: { branch, leaf } });
      return tags;
    }, tags);
  }, []);

  return { units: [], tags };
};
