export const unique = (source) => {
  return [...new Set(source)].filter((s) => s !== null);
};
export const merge = (...sources) => {
  return [
    ...new Set(
      sources
        .flat()
        .filter((source) => source !== null)
        .flat(),
    ),
  ];
};

export function* chunk(array, chunkSize = 4) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}
export const ensure = (input) => {
  return (Array.isArray(input) ? input : [input]).filter((i) => !!i);
};
export const ensureFlat = (arr) => {
  return ensure(arr).reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? ensureFlat(item) : item);
  }, []);
};

export function shuffle(array) {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export const reverse = (array) => {
  return [...array].reverse();
};
