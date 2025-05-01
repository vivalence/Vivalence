import { wrap } from "@mikro-orm/core";
// import { deepEquals, deepMerge, strings } from "@vivalence/shared";

export default async function installDependency(input, ctx) {
  let operation = null;

  if (!input.dependency.slug) throw new Error("Dependency slug is required");

  const query = {};
  if (input.dependency.id) query.id = input.dependency.id;
  if (input.dependency.slug) query.slug = input.dependency.slug;
  let dependency = await ctx.runtime.entities.dependency.findOne(query);

  const { conditions, preconditions, ...inputDependency } = input.dependency;

  if (!dependency) {
    dependency = await ctx.runtime.entities.dependency.create(inputDependency);
    operation = "create";
  } else {
    dependency = wrap(dependency).assign(inputDependency);
    operation = "update";
  }

  await expectConditions({ dependency, conditions, preconditions }, ctx);

  await ctx.runtime.entities.em.flush();

  return { dependency, operation, status: "success" };
}

const expectCondition = (ctx) => (condition) => {
  return ctx.runtime.entities.condition.expect({ ...condition });
};

async function expectConditions({ dependency, ...input }, ctx) {
  const conditionSets = ["conditions", "preconditions"];
  await Promise.all(
    conditionSets.map(async (setName) => {
      const inputConditions = input[setName] || [];
      const depCollection = dependency[setName];
      depCollection.removeAll();
      const expectedConditions = await Promise.all(inputConditions.map(expectCondition(ctx)));
      expectedConditions.filter(Boolean).forEach((condition) => depCollection.add(condition));
    }),
  );
  return dependency;
}
