import { deepMerge } from "@vivalence/shared";

export default (runtime) => {
  const schema = runtime.schema;

  const tags = Object.entries(schema.annotations).reduce((tags, [branch, leafs]) => {
    if (branch === "lemma") return tags;
    const tag = { traits: ["ONTOLOGICAL"], data: { ONTOLOGICAL: { branch } } };
    tags.push(tag);

    return leafs.enum.reduce((tags, leaf) => {
      const tag = { traits: ["ONTOLOGICAL"], data: { ONTOLOGICAL: { branch, leaf } } };

      const { traits, data } = runtime.schema.meta[branch]?.traits?.[leaf] || {};
      if (traits) tag.traits.push(...traits);
      if (data) tag.data = deepMerge(tag.data, data);

      tags.push(tag);
      return tags;
    }, tags);
  }, []);

  return { tags };
};
