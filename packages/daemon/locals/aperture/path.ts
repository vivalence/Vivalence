export default class Path {
  readonly value: string;

  constructor(path: string | Path = "/") {
    const pathStr = path instanceof Path ? path.value : path;
    let normalized = pathStr.startsWith("/") ? pathStr : `/${pathStr}`;
    normalized =
      normalized.endsWith("/") && normalized.length > 1 ? normalized.slice(0, -1) : normalized;

    this.value = normalized;
  }

  join(path: string | Path): Path {
    const pathStr = path instanceof Path ? path.value : path;
    if (!this.value || this.value === "/") return new Path(pathStr);
    if (!pathStr || pathStr === "/") return new Path(this.value);

    return new Path(`${this.value}${pathStr.startsWith("/") ? pathStr : `/${pathStr}`}`);
  }

  toString(): string {
    return this.value;
  }
}
