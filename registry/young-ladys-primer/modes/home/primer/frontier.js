const MASTERED_STATUS = new Set(["KNOWN", "GRADUATED"]);

export const prereqsOf = (concept) => concept.trait.REQUIRES.concepts;

export const isMastered = (concept) =>
  concept.memories.getItems().some((memory) => MASTERED_STATUS.has(memory.status));

export function masteredSlugs(concepts) {
  return new Set(concepts.filter(isMastered).map((concept) => concept.slug));
}

export function frontierOf(concepts, mastered) {
  return concepts.filter((concept) => {
    if (mastered.has(concept.slug)) return false;
    return prereqsOf(concept).every((prerequisite) => mastered.has(prerequisite));
  });
}
