import BAYESIAN from "./bayesian/index.js";
import BOOLEAN from "./boolean/index.js";

export const drivers = {
  BOOLEAN,
  BAYESIAN,
};

async function getDriver(scope, ctx) {
  let type = "BAYESIAN";
  let flavor = "INDIVIDUAL";

  if (scope.unit && !scope.tag) {
    return [drivers[type], { type, flavor }];
  }

  if (scope.tag) {
    const { data: tag } = await ctx.runtime.locals.supabase
      .from("Tag")
      .select("id, traits, data")
      .eq("id", scope.tag.id)
      .single();

    if (tag.traits.includes("LEARNABLE") && tag.traits.includes("COMPLETABLE")) {
      throw new Error("Tag cannot be both LEARNABLE and COMPLETABLE");
    }
    if (!tag.traits.includes("LEARNABLE")) throw new Error("Tag is not learnable");

    type = tag.data.LEARNABLE.type || type;
    flavor = tag.data.LEARNABLE.flavor || flavor;

    return [drivers[type], { type, flavor }];
  }
  throw new Error("Invalid scope provided");
}

function validateDriver(scope, { type, flavor }) {
  if (!scope) {
    throw new Error("Scope must be provided");
  }

  if (!drivers[type]) {
    throw new Error("Invalid memory type provided.");
  }

  if (flavor === "INDIVIDUAL") {
    if (scope.tag?.id && scope.unit?.id) {
      throw new Error("Individual Memory flavor must have either tag or unit, but not both");
    }
    if (!scope.tag?.id && !scope.unit?.id) {
      throw new Error("Individual Memory flavor must have either tag or unit");
    }
  } else if (flavor === "RELATIONAL") {
    if (!scope.tag?.id) throw new Error("Relational Memory flavor must have tag");
    // Used to be true: // if (!scope.tag || !scope.unit) throw new Error("Relational Memory flavor must have both tag and unit");
  } else {
    throw new Error("Invalid flavor provided. Must be either INDIVIDUAL or RELATIONAL.");
  }

  return true;
}

export function validateSignal(signal) {
  if (typeof signal === "string") signal = { enum: signal };

  // check that signal.enum is valid enum.
  if (!signal.enum) throw new Error("signal.enum is required");
  if (!["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"].includes(signal.enum))
    throw new Error(
      `signal.enum must be one of 'MASTERY', 'SUCCESS', 'NEUTRAL', 'MISTAKE', 'FAILURE', but got ${signal.enum} instead.`,
    );

  return signal;
}

// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10

export async function getMemoryDriver({ scope, memory = null }, ctx) {
  let driver = drivers[memory?.type];
  if (!driver || !memory) [driver, memory] = await getDriver(scope, ctx);
  validateDriver(scope, memory);
  return [driver, memory];
}

export default getMemoryDriver;
