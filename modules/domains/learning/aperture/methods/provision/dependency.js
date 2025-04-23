import { Scope } from "@vivalence/shared";
import lock from "./lib/lock.js";

export default async function provision({ dependency, ...body }, ctx) {
  const user = await ctx.runtime.services.identity.getUser();
  const scope = new Scope({ ...body.scope, user: { id: user.id } });

  if (lock.has(scope)) return { status: "locked" };
  lock.set(scope);

  let instructions, error;
  try {
    const itinerary = dependency.itinerary.tactic;

    const input = {
      blacklist: body.blacklist,
      scope,
      tactic: { slug: itinerary.slug },
      relations: itinerary.relations,
      masks: itinerary.masks,
    };

    instructions = await ctx.runtime.call(`/provision/tactic`, input);

    if (instructions.length > 0) {
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].type === "SIGNAL") continue;
        ctx.runtime.entities.instruction.create({
          runtime: ctx.runtime.entity.id,
          user: user.id,
          dependency: dependency.id,
          tactic: instructions[i].scope.tactic.id,
          data: instructions[i],
          index: i,
        });
      }

      await ctx.runtime.entities.em.flush();
    }
  } catch (err) {
    console.error(`[PROVISIONING ERROR]`);
    console.error(`[PROVISIONING ERROR] message`, err.message);
    console.error(err);
    console.log("JSON.stringify({ dependency, scope, blacklist })");
    console.log(JSON.stringify({ dependency, scope, blacklist }));
    console.error(`[/PROVISIONING ERROR]`);
    error = err;
  } finally {
    lock.delete(scope);
    if (error) throw error;
    return instructions;
  }
}
