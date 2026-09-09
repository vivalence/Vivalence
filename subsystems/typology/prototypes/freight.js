import { Path } from "./path.js";

const MIME = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  json: "application/json",
  jsonc: "application/json",
  pdf: "application/pdf",
  md: "text/markdown",
  mdx: "text/markdown",
  org: "text/plain",
  txt: "text/plain",
  tex: "application/x-tex",
  html: "text/html",
  csv: "text/csv",
};

// a path is not a url: every segment is escaped so a name with a space, a hash or a question mark
// survives the wire and comes back the same on the other side
const encoded = (path) => path.split("/").map(encodeURIComponent).join("/");

const decoded = (query) => {
  try {
    return decodeURIComponent(query);
  } catch {
    return query;
  }
};

const match = (lading, query) =>
  lading.find((e) => e.path === query) || lading.find((e) => e.path.replace(/\.[^.]+$/, "") === query) || lading.find((e) => e.slug === query);

const entry = (path) => {
  const name = path.split("/").pop();
  return {
    slug: name.replace(/\.[^.]+$/, ""),
    path,
    type: MIME[name.split(".").pop().toLowerCase()] || "application/octet-stream",
  };
};

export class Freight {
  lading = [];

  constructor(path) {
    if (path instanceof Freight) return path;
    this.path = new Path(path);
  }

  withUrl(url) {
    this.url = url;
    return this;
  }

  stow(paths) {
    this.lading = [...paths].sort().map(entry);
    return this;
  }

  admit(path) {
    if (this.lading.some((held) => held.path === path)) return this;
    this.lading = [...this.lading, entry(path)].sort((a, b) => (a.path < b.path ? -1 : 1));
    return this;
  }

  // a query arrives either as a stowed path or as the escaped one the catalog minted; both name the same file
  resolve(query) {
    return match(this.lading, query) ?? match(this.lading, decoded(query));
  }

  get catalog() {
    return Object.fromEntries(
      this.lading.map((e) => [
        e.path,
        {
          path: e.path,
          type: e.type,
          url: this.url ? this.url.branch("/" + encoded(e.path)).absolute : null,
        },
      ]),
    );
  }
}
