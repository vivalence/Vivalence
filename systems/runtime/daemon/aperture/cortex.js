// @beef
// expose cortex.hallucinate.[faculty][via](xyz)!
// strip wire into kajuit daemon who branches and aims deamon connection.
import { v } from "@vivalence/typology";

const { Request, Tier, Tune } = v.primitives.hallucination;

const ROUND = v.object({
  type: v.string(),
  tune: v.union([Tier, Tune]).optional(),
  request: Request,
});

function validate(input) {
  const round = v.cast(ROUND, { ...input });
  const failure = [...v.errors(ROUND, round)][0];
  if (failure) throw new Error(`[cortex] invalid round ${failure.path}: ${failure.message}`);
  return round;
}

export function cortex(die) {
  if (!die.good.cortex) return;

  const round = (via) => async (ctx) => {
    const { type, tune, request } = validate(ctx.input);
    const faculty = die.good.cortex.findOne({ type, tune, via });
    if (!faculty?.via?.[via])
      throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
    ctx.output = await faculty.via[via](request);
  };

  die.good.aperture
    .branch("/cortex")
    .open("/render", round("render"))
    .open("/stream", round("stream"));
}
