import config from "@vivalence/config";
import { blacklist as Blacklist, deepMerge } from "@vivalence/shared";

export default async function ({ take, ...body }, ctx) {
  let status = "success";
  const user = await ctx.runtime.services.identity.getUser();

  const dependency = await ctx.runtime.entities.dependency.findOneOrFail(body.dependency);

  let blacklist = Blacklist.init(body.blacklist);

  let scope = {
    user: { id: user.id },
    runtime: { id: ctx.runtime.entity.id }, // Changed from manifest.id to entity.id
    dependency: { id: dependency.id },
  };

  const counted = await count({ scope, blacklist }, ctx);
  const instructions = await read({ scope, blacklist, take }, ctx);

  if (counted <= take || counted <= config.env.get("INSTRUCTION_PROVISION_FLOOR")) {
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
  // MikroORM find with criteria and options
  const queueEntries = await ctx.runtime.entities.instruction.find(
    {
      // status: "PENDING", // Commented out as in original
      runtime: ctx.runtime.entity.id,
      user: scope.user?.id,
      dependency: scope.dependency?.id,
      id: { $nin: blacklist.instructions },
    },
    {
      orderBy: [{ createdAt: "ASC" }, { index: "ASC" }],
      limit: take,
    },
  );

  // Transform data similarly to original
  return queueEntries.map((entry) => {
    const data = { ...entry.data };
    data.scope = { ...data.scope, queue: { id: entry.id } };
    return data;
  });
}
