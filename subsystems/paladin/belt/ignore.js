import { globToRegExp } from "@std/path";

export const IGNORE = ["bak", "archive", "slp", "node_modules", ".git", ".DS_Store", "*.bak"];

export const skip = (globs = IGNORE) => {
  const rules = globs.map((glob) => globToRegExp(glob));
  return (name) => rules.some((rule) => rule.test(name));
};
