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

export default { merge };
