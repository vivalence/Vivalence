import config from "@vivalence/config";
import { deepMerge } from "@vivalence/shared";
import { Blacklist, Scope } from "@vivalence/typology";

export default async function ({ take, ...input }, ctx) {
  const tactic = ctx.runtime.modules.tactics[input.tactic.slug];
  if (!tactic) throw new Error("@feed/game.js Unknown tactic", input);

  let status = "success";

  const user = await ctx.runtime.services.identity.getUser();

  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
    tactic: { slug: input.tactic.slug },
  });

  const total = await count({ scope, blacklist }, ctx);
  const minimum = config.env.get("INSTRUCTION_PROVISION_FLOOR");

  const instructions = await read({ scope, blacklist, take }, ctx);

  if (total < take || total <= minimum) {
    status = "provisioning";
    ctx.runtime.call("/provision/tactic", { ...input, scope, blacklist });
  }

  return { instructions, status };
}

async function count({ scope, blacklist }, ctx) {
  // MikroORM count method with where conditions
  const count = await ctx.runtime.entities.instruction.count({
    // status: "PENDING",
    user: scope.user?.id,
    tactic: scope.tactic.slug,
    id: { $nin: blacklist.instructions },
  });

  return count;
}

async function read({ scope, blacklist, take }, ctx) {
  const queueEntries = await ctx.runtime.entities.instruction.find(
    {
      // status: "PENDING",
      user: scope.user?.id,
      tactic: scope.tactic.slug,
      id: { $nin: blacklist.instructions },
    },
    {
      orderBy: [{ createdAt: "ASC" }, { index: "ASC" }],
      limit: take,
    },
  );

  return queueEntries;
}
