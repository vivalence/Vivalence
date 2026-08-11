import { string } from "@vivalence/typology";

const faces = (literal, recall) => ({
  answer: string.fold(
    (recall === "KNOWN" ? literal?.trait?.TRANSLATED?.known : literal?.trait?.TRANSLATED?.learning) ?? "",
  ),
  learning: string.fold(literal?.trait?.TRANSLATED?.learning ?? ""),
});

export const distractors = (target, pool, recall = "LEARNING", take = 3) => {
  const wanted = faces(target, recall);
  const seenAnswer = new Set([wanted.answer]);
  const seenLearning = new Set([wanted.learning]);

  return pool
    .filter((candidate) => {
      if (candidate.id === target.id) return false;
      const candidateFaces = faces(candidate, recall);
      if (seenAnswer.has(candidateFaces.answer) || seenLearning.has(candidateFaces.learning)) return false;
      seenAnswer.add(candidateFaces.answer);
      seenLearning.add(candidateFaces.learning);
      return true;
    })
    .map((candidate) => ({ candidate, score: string.dice(wanted.answer, faces(candidate, recall).answer) }))
    .sort((one, other) => other.score - one.score)
    .slice(0, take)
    .map((scored) => scored.candidate);
};
