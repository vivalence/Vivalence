import { Signature } from "./signature.js";
import { hash } from "@vivalence/shared";
import { is } from "@vivalence/typology";

const join = (...segments) => {
  const path = segments.filter(Boolean).join("/").replace(/\/+/g, "/");
  const withLeading = path.startsWith("/") ? path : "/" + path;
  return withLeading.replace(/\/$/, "") || "/";
};

export class Path extends Signature {
  constructor(signature = "", trace) {
    super(signature, trace);
  }
  get segment() {
    return this.signature;
  }

  ought(thing) {
    return is.path(thing);
  }

  hasher() {
    return hash.array([
      this.signature,
      // this.trace?.hash,
    ]);
  }
  parse(thing) {
    this.signature = `/${thing
      .split("/")
      .filter((s) => !!s)
      .join("/")}`;
  }
  get absolute() {
    return this.array.join("");
  }
}

// // // move to shared
// // // expand to resolve
// // const join = (...segments) => {
// //   const path = segments.filter(Boolean).join("/").replace(/\/+/g, "/");
// //   const withLeading = path.startsWith("/") ? path : "/" + path;
// //   return withLeading.replace(/\/$/, "") || "/";
// // };

// // const fromRemainder = (params) => {
// //   const path = new Path();
// //   while (params[path.depth]) {
// //     path.leaf(params[path.depth]);
// //   }
// //   return path.up();
// // };

// // const fromFile = (url) => {
// //   // TODO: apply trace of 'file:/'
// //   const [file, ...dir] = url
// //     .replace(/^file:\/\//, "")
// //     .split("/")
// //     .reverse();
// //   return new Path(file).from(new Path(dir.reverse().join("/")));
// // };

// // export const path = {
// //   // join,
// //   file: fromFile,
// //   fromFile,
// //   fromRemainder,
// //   remainder: fromRemainder,
// //   params: fromRemainder,
// // };

// // MAYBE IMPLEMENT SIGNATURE??!! ?optionally
// // actually maybe really makes sense to implement path as a metastructure atop signal signatures.
// // literally insane. conceptually alone, but also a really nice way to integrate with the vector too.

// // path should implement ~/ syntax for homing.
// export class Path {
//   segment = "";
//   trace = null; // null | Path | Url
//   gauges = [];
//   constructor(path = "", trace = null) {
//     if (path instanceof Path) this.segment = path.down().segment;
//     else if (is.array(path)) this.segment = join(...path);
//     else this.segment = join(path);
//     if (trace) this.from(trace);
//   }
//   from(trace) {
//     this.trace = trace;
//     this.trace.gauges.push(this);
//     return this;
//   }
//   branch(branch) {
//     const path = new Path(branch, this);
//     return path;
//   }
//   leaf(leaf) {
//     return this.yeet(leaf);
//   }
//   yeet(yeet) {
//     let path = this;
//     while (path.heir) path = path.heir;
//     path.branch(yeet);
//     return this;
//   }
//   up() {
//     return new Path([this.segment, this.gauges[0]?.up()?.segment]);
//   }
//   down() {
//     return new Path([this.trace?.down()?.segment, this.segment]);
//   }
//   toString() {
//     //legacy
//     return this.down().segment;
//   }
//   get depth() {
//     let depth = 0;
//     let path = this;
//     while (path.gauges[0]) {
//       path = path.gauges[0];
//       depth++;
//     }
//     return depth;
//   }

//   get heir() {
//     return this.gauges[0];
//   }
//   get absolute() {
//     // if (this.gauges[1]) throw new Error("@Path: ambivalent gauges on up");
//     return this.trace ? this.down().value : this.up().value;
//   }
//   get value() {
//     return this.segment;
//   }
// }
