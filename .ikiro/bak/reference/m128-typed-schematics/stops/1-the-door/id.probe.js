import { v } from "@vivalence/typology";

const { Manifest } = v.primitives;
const { Slug } = v.scalars;

const twice = v.object({ first: Slug, second: Slug.optional() });
const held = { type: "mode", slug: "dojo" };

const attempt = (run) => {
  try {
    return run();
  } catch (error) {
    return `THROWS ${error.message.split("\n")[0]}`;
  }
};

console.log(
  JSON.stringify(
    {
      slug: JSON.parse(JSON.stringify(Manifest.properties.slug)),
      cast: attempt(() => Manifest.cast(held)),
      faults: attempt(() => Manifest.faults({ type: "mode", slug: "Not A Slug" })),
      compiled: attempt(() => Manifest.compile().Check(held)),
      twice: {
        faults: attempt(() => twice.faults({ first: "a", second: "B!" })),
        compiled: attempt(() => twice.compile().Check({ first: "a", second: "b" })),
        collected: attempt(() => v.collect(twice, { first: "a", second: "b" }, Slug)),
      },
    },
    null,
    2,
  ),
);
