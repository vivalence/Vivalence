export default class Path {
  readonly value: string;
  ancestor: null | Path;

  constructor(path: string | Path = "", ancestor: null | Path = null) {
    this.value = path instanceof Path ? path.value : path;
    this.ancestor = ancestor;
  }

  toString(): string {
    return this.value;
  }
}
