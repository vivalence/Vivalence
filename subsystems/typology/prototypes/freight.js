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
};

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

  resolve(query) {
    return (
      this.lading.find((e) => e.path === query) ||
      this.lading.find((e) => e.path.replace(/\.[^.]+$/, "") === query) ||
      this.lading.find((e) => e.slug === query)
    );
  }

  get catalog() {
    return Object.fromEntries(
      this.lading.map((e) => [
        e.path,
        {
          path: e.path,
          type: e.type,
          url: this.url ? this.url.branch("/" + e.path).absolute : null,
        },
      ]),
    );
  }
}
