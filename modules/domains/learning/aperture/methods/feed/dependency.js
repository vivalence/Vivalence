import config from "@vivalence/config";
import { Blacklist, Scope, deepMerge } from "@vivalence/shared";

export default async function ({ take, ...input }, ctx) {
  let status = "success";

  const user = await ctx.runtime.services.identity.getUser();

  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
  });

  const dependency = await ctx.runtime.entities.dependency.findOneOrFail(
    scope.dependency,
  );

  const counted = await count({ scope, blacklist }, ctx);

  const instructions = await read({ scope, blacklist, take }, ctx);

  if (
    counted <= take ||
    counted <= config.env.get("INSTRUCTION_PROVISION_FLOOR")
  ) {
    status = "provisioning";
    ctx.runtime.call("/provision/dependency", { dependency, scope, blacklist });
  }

  return { instructions, status };
}

async function count({ scope, blacklist }, ctx) {
  // MikroORM count method with where conditions
  const count = await ctx.runtime.entities.instruction.count({
    // status: "PENDING",
    runtime: ctx.runtime.entity.id,
    user: scope.user?.id,
    dependency: scope.dependency?.id,
    id: { $nin: blacklist.instructions },
  });

  return count;
}

async function read({ scope, blacklist, take }, ctx) {
  const queueEntries = await ctx.runtime.entities.instruction.find(
    {
      // status: "PENDING",
      user: scope.user?.id,
      dependency: scope.dependency?.id,
      id: { $nin: blacklist.instructions },
    },
    {
      orderBy: [{ createdAt: "ASC" }, { index: "ASC" }],
      limit: take,
    },
  );

  return queueEntries.map((entry) => {
    const data = { ...entry.data };
    data.scope = new Scope({ ...data.scope, instruction: { id: entry.id } });
    return data;
  });
}
