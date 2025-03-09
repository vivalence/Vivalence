import { blacklist as Blacklist, deepMerge } from "@vivalence/shared";
import lock from "./lib/lock.js";

export default async function provision({ dependency, blacklist, scope }, ctx) {
  const user = await ctx.runtime.services.identity.getUser();
  scope.user = { id: user.id };

  if (lock.has(scope)) return { status: "locked" };
  lock.set(scope);

  let instructions, error;
  try {
    // const tacticRef = await ctx.runtime.entities.tactic.getRef({slug: dependency.itinerary.tactic.slug,});

    const itinerary = dependency.itinerary.tactic;

    const input = {
      blacklist,
      scope,
      tactic: { slug: itinerary.slug },
      relations: itinerary.relations,
      masks: itinerary.masks,
    };

    instructions = await ctx.runtime.call(`/provision/tactic`, input);
    console.log(
      "/Users/finn/vivalence/code/vivalence/modules/domains/base/aperture/methods/provision/dependency.js instructions",
      instructions,
    );
    // instructions = [];

    if (instructions.length > 0) {
      // Create queue entries one by one
      for (let i = 0; i < instructions.length; i++) {
        ctx.runtime.entities.instruction.create({
          runtime: ctx.runtime.entity.id,
          user: user.id,
          dependency: dependency.id,
          tactic: tactic.id,
          data: instructions[i],
          index: i,
        });
      }

      // Persist all created entities at once
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
