import { Path, parse } from "./path.js";
import { is } from "@vivalence/typology";

// @beef to be shimied.
const cwd = () => globalThis.Deno?.cwd?.() ?? "/";
const home = () => {
  try {
    return globalThis.Deno?.env.get("HOME") ?? "/";
  } catch {
    return "/";
  }
};

const expand = (s) => (s === "~" || s.startsWith("~/") ? home() + s.slice(1) : s);

// @beef `..` is data here, collapsed at read time by reduce. The radical move —
// branch("..") as navigation (returning trace) — breaks branch's contract:
// branch always returns a NEW node attached to the tree, and callers chain on
// that. Proposed instead, keeping branch pure:
//   ascend()        → this.trace ?? this          (pure walk, clamps at "/")
//   walk(relative)  → fold segments: ".." ascends, "." stays, names branch
//     walk("../lib/mod.ts") ≡ this.ascend().branch("lib").branch("mod.ts")
// walk navigates existing structure and only appends what is new, so `..`
// never enters the tree as a node; reduce remains the read-time safety net
// for chains built with plain branch.
const reduce = (parts, anchored) =>
  parts.reduce((out, part) => {
    if (!part || part === "." || part === "/") return out;
    if (part === "..") {
      if (out.length && out.at(-1) !== "..") out.pop();
      else if (!anchored) out.push("..");
      return out;
    }
    out.push(part);
    return out;
  }, []);

const segments = (s) => {
  const anchored = s.startsWith("/");
  const chain = reduce(s.split("/"), anchored).map((nature) => ({ nature }));
  if (anchored) return [{ nature: "/" }, ...chain];
  return chain.length ? chain : [{ nature: "." }];
};

export class FilePath extends Path {
  static coercions = [[(s) => is.string(s), (s) => segments(expand(s))]];

  get anchored() {
    return this.root.nature === "/";
  }

  get relative() {
    return !this.anchored;
  }

  get parts() {
    return reduce(this.array.map((node) => node.nature), this.anchored);
  }

  get absolute() {
    const joined = this.parts.join("/");
    return this.anchored ? "/" + joined : joined || ".";
  }

  get json() {
    return parse(this.absolute, this.anchored ? "/" : "", this.dirname);
  }

  resolve(base = cwd()) {
    if (this.anchored) return new this.constructor(this.absolute);
    return new this.constructor(String(base) + "/" + this.absolute);
  }

  relativeTo(from = cwd()) {
    const origin = new this.constructor(String(from)).resolve().parts;
    const target = this.resolve().parts;
    let shared = 0;
    while (shared < origin.length && shared < target.length && origin[shared] === target[shared]) shared++;
    const ascent = Array(origin.length - shared).fill("..");
    return new this.constructor([...ascent, ...target.slice(shared)].join("/") || ".");
  }
}
