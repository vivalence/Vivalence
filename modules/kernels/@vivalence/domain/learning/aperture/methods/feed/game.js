import config from "@vivalence/config";
import { Blacklist, Scope } from "@vivalence/typology";

// input {scope game blacklist take expect}
export default async function ({ take = 1, expect = false, ...input }, ctx) {
  const game = ctx.runtime.modules.games[input.game.slug];
  if (!game) throw new Error("@feed/game.js Unknown game", input);

  let status = "success";

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
  });

  const total = await count({ scope, blacklist }, ctx);
  const minimum = config.env.get("INSTRUCTION_PROVISION_FLOOR");

  const instructions = await read({ scope, blacklist, take }, ctx);

  if (total < take || total <= minimum) {
    status = "provisioning";

    const promise = ctx.runtime //
      .call("/provision/game", {
        ...input,
        scope,
        blacklist,
      });

    if (expect && instructions.length < 1) {
      (await promise).map((i) => instructions.push(i));
    }
  }

  return { instructions, status };
}

async function count({ scope, blacklist }, ctx) {
  // MikroORM count method with where conditions
  const count = await ctx.runtime.entities.instruction.count({
    // status: "PENDING",
    user: scope.user.id,
    game: scope.game?.slug,
    id: { $nin: blacklist.instructions },
  });

  return count;
}

async function read({ scope, blacklist, take }, ctx) {
  const instructions = await ctx.runtime.entities.instruction.find(
    {
      // status: "PENDING",
      user: scope.user.id,
      game: scope.game?.slug,
      id: { $nin: blacklist.instructions },
    },
    {
      orderBy: [{ createdAt: "ASC" }, { index: "ASC" }],
      limit: take,
    },
  );

  return instructions;
}
