import { Signature } from "./signature.js";
import { hash } from "@vivalence/shared";
import { is } from "@vivalence/typology";

// console.log("{ Signature, is, hash }", Signature, is, hash);
// import { join, normalize } from "@std/path";

// import * as path from "jsr:@std/path";
// path.join("foo", "bar", "baz.txt");
// path.dirname("/foo/bar/baz.txt");
// path.basename("/foo/bar/baz.txt");
// path.extname("file.txt");
// path.resolve("./relative/path");

export class Path extends Signature {
  static coercions = [
    [
      (s) => is.string(s),
      (s) => {
        const normalized = ("/" + s).replace(/\/+/g, "/").replace(/\/$/, "") || "/";
        return { nature: normalized };
      },
    ],
  ];

  get json() {
    return { ...super.json, filename: this.filename, dirname: this.dirname };
  }
  // static coercions = [[is.string, (s) => ({ nature: normalize(s) })]];

  get absolute() {
    return this.array.map((s) => s.nature).join("") || "/";
  }
  get filename() {
    const abs = this.absolute;
    const lastSlash = abs.lastIndexOf("/");
    const name = lastSlash >= 0 ? abs.substring(lastSlash + 1) : abs;
    if (name && name.includes(".") && !name.startsWith(".")) {
      return name;
    }
    return null;
  }

  get dirname() {
    const abs = this.absolute;
    const lastSlash = abs.lastIndexOf("/");
    if (lastSlash <= 0) return "/";
    return abs.substring(0, lastSlash);
  }

  // get basename() {const abs = this.absolute; const lastSlash = abs.lastIndexOf("/"); const name = lastSlash >= 0 ? abs.substring(lastSlash + 1) : abs; return name || null;}
  // get filename() {} get dirname() {} get basename() {}

  [Symbol.toPrimitive](hint) {
    if (hint === "string" || hint === "default") return this.absolute;
    throw new Error("@typology/path: unhandled toPrimitive hint: " + hint);
  }

  // legacy
  get segment() {
    return this.nature;
  }
}
