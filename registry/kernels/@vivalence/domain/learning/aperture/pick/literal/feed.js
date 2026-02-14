import getDueLiterals from "./due.js";
import getNovelLiterals from "./novel.js";

export default async function (input, ctx) {
  const { scope, seek, blacklist, status, batch, stock } = input;
  const take = input.take || (batch || 0) + (stock || 0);

  let debt = -take;
  const literals = [];

  if (debt < 0) {
    const dueLiterals = await getDueLiterals(
      {
        blacklist,
        scope,
        seek,
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
    const novelLiterals = await getNovelLiterals(
      {
        scope,
        blacklist,
        seek,
        take: Math.abs(debt),
      },
      ctx,
    );

    if (novelLiterals.length > 0) {
      literals.push(...novelLiterals);
      debt += novelLiterals.length;
    }
  }

  return literals;
}
