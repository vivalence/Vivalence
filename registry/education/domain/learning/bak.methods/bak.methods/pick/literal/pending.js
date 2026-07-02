import getDueLiterals from "./due.js";
import getNewLiterals from "./new.js";

export default async function (body, ctx) {
  const { scope, symbolIds, blacklist, status, take = 1 } = body;

  let debt = -take;
  const literals = [];

  if (debt < 0) {
    const dueLiterals = await getDueLiterals(
      {
        blacklist,
        scope,
        symbolIds,
        take: Math.abs(debt),
      },
      ctx,
    );

    if (dueLiterals.length > 0) {
      literals.push(...dueLiterals);
      debt += dueLiterals.length;
    }
  }

  if (debt < 0) {
    const newLiterals = await getNewLiterals(
      {
        scope,
        blacklist,

        symbolIds,
        take: Math.abs(debt),
      },
      ctx,
    );

    if (newLiterals.length > 0) {
      literals.push(...newLiterals);
      debt += newLiterals.length;
    }
  }

  return literals;
}
