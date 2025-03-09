export default class Path {
  readonly value: string;

  constructor(path: string | Path = "") {
    this.value = path instanceof Path ? path.value : path;
  }

  toString(): string {
    return this.value;
  }
}
