// useSkeleton — read the current skeleton level from Svelte context.
//
// Returns the level as a function (call it to get the number) so the
// reactivity flows through. Defaults to skeleton 1 if no provider is
// in the parent chain.

import { getContext } from "svelte";

export const SKELETON_CONTEXT_KEY = Symbol("skeleton-level");

export const useSkeleton = () => {
  const reader = getContext(SKELETON_CONTEXT_KEY);
  if (typeof reader === "function") return reader;
  return () => 1; // fallback — main work area
};
