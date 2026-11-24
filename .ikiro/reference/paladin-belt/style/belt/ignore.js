import { globToRegExp } from "@std/path";

// .#name is an emacs lock symlink (points nowhere), #name# its autosave — neither is a module
export const IGNORE = ["bak", "archive", "slp", "node_modules", ".git", ".DS_Store", "*.bak", ".#*", "#*#"];

export const skip = (globs = IGNORE) => {
  const rules = globs.map((glob) => globToRegExp(glob));
  return (name) => rules.some((rule) => rule.test(name));
};
