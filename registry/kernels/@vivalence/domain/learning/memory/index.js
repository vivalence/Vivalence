import BAYESIAN from "./bayesian/index.js";
import BOOLEAN from "./boolean/index.js";

export const drivers = {
  BOOLEAN,
  BAYESIAN,
};

async function getDriver(scope, ctx) {
  let driver = "BAYESIAN";
  let type = "INDIVIDUAL";

  if (scope.literal && !scope.symbol) {
    return [drivers[driver], { driver, type }];
  }

  if (scope.symbol) {
    const symbol = await ctx.daemon.entities.symbol.findOne({
      id: scope.symbol.id,
    });
    if (
      symbol.traits.includes("LEARNABLE") &&
      symbol.traits.includes("COMPLETABLE")
    ) {
      throw new Error("Symbol cannot be both LEARNABLE and COMPLETABLE");
    }
    if (!symbol.traits.includes("LEARNABLE"))
      throw new Error("Symbol is not learnable");

    driver = symbol.data.LEARNABLE.driver || driver;
    type = symbol.data.LEARNABLE.type || type;

    return [drivers[driver], { driver, type }];
  }
  throw new Error("Invalid scope provided");
}

function validateDriver(scope, { driver, type }) {
  if (!scope) {
    throw new Error("Scope must be provided");
  }

  if (!drivers[driver]) {
    throw new Error("Invalid memory type provided.");
  }

  if (type === "INDIVIDUAL") {
    if (scope.symbol?.id && scope.literal?.id) {
      throw new Error(
        "Individual Memory flavor must have either symbol or literal, but not both",
      );
    }
    if (!scope.symbol?.id && !scope.literal?.id) {
      throw new Error(
        "Individual Memory flavor must have either symbol or literal",
      );
    }
  } else if (type === "RELATIONAL") {
    if (!scope.symbol?.id)
      throw new Error("Relational Memory flavor must have symbol");
    // Used to be true: // if (!scope.symbol || !scope.literal) throw new Error("Relational Memory flavor must have both symbol and literal");
  } else {
    throw new Error(
      "Invalid flavor provided. Must be either INDIVIDUAL or RELATIONAL.",
    );
  }

  return true;
}

export function validateSignal(signal) {
  if (typeof signal === "string") signal = { enum: signal };

  // check that signal.enum is valid enum.
  if (!signal.enum) throw new Error("signal.enum is required");
  if (
    !["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"].includes(
      signal.enum,
    )
  )
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
  let driver = drivers[memory?.driver];
  if (!driver || !memory) [driver, memory] = await getDriver(scope, ctx);
  validateDriver(scope, memory);
  return [driver, memory];
}

export default getMemoryDriver;
