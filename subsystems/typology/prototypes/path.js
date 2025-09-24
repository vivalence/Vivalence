import { is } from "@vivalence/shared";
// import { dirname, fromFileUrl, join } from "@std/path";

// move to shared
// expand to resolve
const join = (...segments) => {
  const path = segments.filter(Boolean).join("/").replace(/\/+/g, "/");
  const withLeading = path.startsWith("/") ? path : "/" + path;
  return withLeading.replace(/\/$/, "") || "/";
};

const fromRemainder = (params) => {
  const path = new Path();
  while (params[path.depth]) {
    path.leaf(params[path.depth]);
  }
  return path.up();
};

export const path = {
  // join,
  // fromImport: (url) => {
  //   return new Path(fromFileUrl(url));},
  fromRemainder,
  fromParams: fromRemainder,
};

// MAYBE IMPLEMENT SIGNATURE??!! ?optionally
// actually maybe really makes sense to implement path as a metastructure atop signal signatures.
// literally insane. conceptually alone, but also a really nice way to integrate with the vector too.

export class Path {
  segment = "";
  ancestor = null;
  trunks = [];
  constructor(path = "", ancestor = null) {
    if (path instanceof Path) this.segment = path.down().segment;
    else if (is.array(path)) this.segment = join(...path);
    else this.segment = join(path);
    if (ancestor) this.ancestor = ancestor;
  }
  branch(branch) {
    const path = new Path(branch, this);
    this.trunks.push(path);
    return path;
  }
  leaf(leaf) {
    let path = this;
    while (path.trunks[0]) path = path.trunks[0];
    path.branch(leaf);
    return this;
  }
  up() {
    return new Path([this.segment, this.trunks[0]?.up()?.segment]);
  }
  down() {
    return new Path([this.ancestor?.down()?.segment, this.segment]);
  }
  toString() {
    //legacy
    return this.down().segment;
  }
  get depth() {
    let depth = 0;
    let path = this;
    while (path.trunks[0]) {
      path = path.trunks[0];
      depth++;
    }
    return depth;
  }
  get absolute() {
    return this.ancestor ? this.down().value : this.up().value;
  }
  get value() {
    return this.segment;
  }
}
