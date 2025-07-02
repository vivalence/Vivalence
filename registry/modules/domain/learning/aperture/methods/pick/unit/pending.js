import getDueUnits from "./due.js";
import getNewUnits from "./new.js";

export default async function (body, ctx) {
  const { scope, tagIds, blacklist, status, take = 1 } = body;

  let debt = -take;
  const units = [];

  if (debt < 0) {
    const dueUnits = await getDueUnits(
      {
        blacklist,
        scope,
        tagIds,
        take: Math.abs(debt),
      },
      ctx,
    );

    if (dueUnits.length > 0) {
      units.push(...dueUnits);
      debt += dueUnits.length;
    }
  }

  if (debt < 0) {
    const newUnits = await getNewUnits(
      {
        scope,
        blacklist,

        tagIds,
        take: Math.abs(debt),
      },
      ctx,
    );

    if (newUnits.length > 0) {
      units.push(...newUnits);
      debt += newUnits.length;
    }
  }

  return units;
}
