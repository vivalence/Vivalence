import TreeState from "./state.svelte.js";

const TREE_STATE_KEY = Symbol("TreeState");
const context = new Map();

export function initTreeState({ root, isOpen = true }) {
  const state = new TreeState({ root, isOpen });
  context.set(TREE_STATE_KEY, state);
  return state;
}

export function getTreeState() {
  const state = context.get(TREE_STATE_KEY);
  if (!state) {
    throw new Error("Navigation state context not found");
  }
  return state;
}
