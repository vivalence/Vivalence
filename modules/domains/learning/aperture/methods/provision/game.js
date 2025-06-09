import { Blacklist, Scope } from "@vivalence/shared";
import lock from "./lib/lock.js";

// input {scope game blacklist}
export default async function provision(input, ctx) {
  const game = ctx.runtime.modules.games[input.game.slug];

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({
    ...(input?.scope || {}),
    game: { slug: game.manifest.slug },
    user: { id: user.id },
  });

  if (lock.has(scope)) return { status: "locked" };
  lock.set(scope);

  let instructions, error;

  try {
    instructions = await ctx.runtime //
      .call(`/game/${game.manifest.slug}/provision`, {
        ...input,
        blacklist,
        scope,
      });

    if (instructions.length > 0) {
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].type === "SIGNAL") continue;

        const instruction = await ctx.runtime.entities.instruction.create({
          user: user.id,
          game: game.manifest.slug,

          data: instructions[i].instruction,
          bundle: instructions[i].bundle,
          scope: instructions[i].scope,
          index: i,
        });
        instructions[i] = instruction;
      }

      await ctx.runtime.entities.em.flush();
    }
  } catch (err) {
    console.error(`[PROVISIONING ERROR]`);
    console.error(`[PROVISIONING ERROR] message`, err.message);
    console.error(err);
    console.log("JSON.stringify({ game, scope, blacklist })");
    console.log(JSON.stringify({ game, scope, blacklist }));
    console.error(`[/PROVISIONING ERROR]`);
    error = err;
  } finally {
    lock.delete(scope);
    if (error) throw error;
    return instructions;
  }
}
