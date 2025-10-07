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

const fromFile = (url) => {
  // TODO: apply ancestor of 'file:/'
  const [file, ...dir] = url
    .replace(/^file:\/\//, "")
    .split("/")
    .reverse();
  return new Path(file).from(new Path(dir.reverse().join("/")));
};

export const path = {
  // join,
  file: fromFile,
  fromFile,
  fromRemainder,
  remainder: fromRemainder,
  params: fromRemainder,
};

// MAYBE IMPLEMENT SIGNATURE??!! ?optionally
// actually maybe really makes sense to implement path as a metastructure atop signal signatures.
// literally insane. conceptually alone, but also a really nice way to integrate with the vector too.

// path should implement ~/ syntax for homing.
export class Path {
  segment = "";
  ancestor = null; // null | Path | Url
  trunks = [];
  constructor(path = "", ancestor = null) {
    if (path instanceof Path) this.segment = path.down().segment;
    else if (is.array(path)) this.segment = join(...path);
    else this.segment = join(path);
    if (ancestor) this.from(ancestor);
  }
  from(ancestor) {
    this.ancestor = ancestor;
    this.ancestor.trunks.push(this);
    return this;
  }
  branch(branch) {
    const path = new Path(branch, this);
    return path;
  }
  leaf(leaf) {
    return this.yeet(leaf);
  }
  yeet(yeet) {
    let path = this;
    while (path.heir) path = path.heir;
    path.branch(yeet);
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

  get heir() {
    return this.trunks[0];
  }
  get absolute() {
    // if (this.trunks[1]) throw new Error("@Path: ambivalent trunks on up");
    return this.ancestor ? this.down().value : this.up().value;
  }
  get value() {
    return this.segment;
  }
}
