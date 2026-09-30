// @beef
// @beef expose cortex.hallucinate.[faculty][via](xyz)!
// @beef strip wire into anima daemon who branches and aims deamon connection.
import { v } from "@vivalence/typology";

const { Request, Choice, Tier, Tune } = v.primitives.hallucination;

const ROUND = v.object({
  type: v.string(),
  tune: v.union([Tier, Tune]).optional(),
  request: v.union([Request, Choice.Round]),
});

function validate(input) {
  const round = v.cast(ROUND, { ...input });
  const failure = [...v.errors(ROUND, round)][0];
  if (failure) throw new Error(`[cortex] invalid round ${failure.path}: ${failure.message}`);
  return round;
}

export const cortex = async (die, next) => {
  if (die.daemon.cortex) {
    const round = (via) => async (ctx) => {
      const { type, tune, request } = validate(ctx.input);
      const faculty = die.daemon.cortex.findOne({ type, tune, via });
      if (!faculty?.via?.[via]) throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
      ctx.output = await faculty.via[via](request);
    };

    die.daemon.aperture
      .branch("/cortex")
      .open("/render", round("render"))
      .open("/stream", round("stream"));
  }
  await next();
};
