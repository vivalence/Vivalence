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

  async index(root = "") {
    const base = root ? this.path.branch(root).absolute : this.path.absolute;

    for await (const entry of Deno.readDir(base)) {
      const relative = root ? root + "/" + entry.name : entry.name;
      if (entry.isDirectory) {
        await this.index(relative);
        continue;
      }
      if (!entry.isFile) continue;
      const ext = entry.name.split(".").pop().toLowerCase();
      this.lading.push({
        slug: entry.name.replace(/\.[^.]+$/, ""),
        path: relative,
        type: MIME[ext] || "application/octet-stream",
      });
    }
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
