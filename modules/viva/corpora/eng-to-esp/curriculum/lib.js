export const compile = (space) => {
  let annotations = [{}];
  for (const [branch, leaves] of space) {
    const newResults = [];
    for (const result of annotations) {
      for (const leaf of leaves) {
        const newResult = { ...result, [branch]: leaf };
        newResults.push(newResult);
      }
    }
    annotations = newResults;
  }
  return annotations.filter(Boolean);
};
