import { tiers } from "@vivalence/typology";

export const TIERS = Object.keys(tiers);
export const EFFORTS = ["none", "low", "medium", "high"];
export const ROUNDS = [1, 2, 5, 10, 25];
export const AXES = ["intelligence", "reasoning", "speed", "thrift"];

export const faculties = (thread) => {
  const cortex = thread?.daemon?.cortex;
  if (!cortex) return [];
  const dialogue = cortex.find({ type: "dialogue" });
  return dialogue.length ? dialogue : cortex.find({});
};

export const thinks = (faculty) =>
  (faculty?.channels?.out ?? []).includes("thinking") || (faculty?.channels?.in ?? []).includes("thinking");

export const contextLabel = (context) =>
  context >= 1_000_000
    ? `${Math.round(context / 1_048_576)}m context`
    : context >= 1000
      ? `${Math.round(context / 1000)}k context`
      : `${context ?? "?"} context`;

export const avenues = (faculty) => Object.keys(faculty?.via ?? {}).join(" + ");

export const origin = (faculty) => [faculty?.provider, faculty?.config?.model].filter(Boolean).join(" · ");

export const summary = (faculty) =>
  faculty
    ? [faculty.type, origin(faculty), contextLabel(faculty.context), thinks(faculty) ? "thinking" : "no thinking"]
        .filter(Boolean)
        .join(" · ")
    : "";

export const write = async (thread, patch) => {
  const current = { ...(thread.trait?.INTELLIGENT ?? {}), ...patch };
  for (const key of Object.keys(current)) if (current[key] === undefined) delete current[key];
  const trait = { ...thread.trait, INTELLIGENT: current };
  const claim = thread.traits.includes("INTELLIGENT") ? {} : { traits: [...thread.traits, "INTELLIGENT"] };
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait, ...claim });
  thread.trait = trait;
  if (claim.traits) thread.traits = claim.traits;
};
