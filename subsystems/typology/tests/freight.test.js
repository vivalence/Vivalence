import { specimen, Url } from "@vivalence/typology";
import { Freight } from "@vivalence/typology";

async function fixtures() {
  const dir = await Deno.makeTempDir();
  await Deno.writeFile(`${dir}/beep.mp3`, new Uint8Array([0xff, 0xfb]));
  await Deno.writeFile(`${dir}/icon.png`, new Uint8Array([0x89, 0x50]));
  await Deno.writeFile(`${dir}/data.json`, new TextEncoder().encode("{}"));
  await Deno.writeFile(`${dir}/mystery.xyz`, new Uint8Array([0x00]));
  await Deno.mkdir(`${dir}/nested`, { recursive: true });
  await Deno.writeFile(`${dir}/nested/deep.wav`, new Uint8Array([0x52, 0x49]));
  await Deno.mkdir(`${dir}/nested/deeper`, { recursive: true });
  await Deno.writeFile(`${dir}/nested/deeper/buried.ogg`, new Uint8Array([0x4f, 0x67]));
  return dir;
}

async function indexed(d) {
  const freight = new Freight(d);
  await freight.index();
  return freight;
}

specimen.describe("Freight", () => {
  specimen.describe("construction", () => {
    specimen.it("from string wraps as Path", () => {
      const freight = new Freight("assets/audio");
      specimen.expect(freight.path.nature).toBe("/assets/audio");
    });

    specimen.it("from Freight returns same instance", () => {
      const original = new Freight("assets");
      const copy = new Freight(original);
      specimen.expect(copy).toBe(original);
    });

    specimen.it("starts with empty entries", () => {
      const freight = new Freight("assets");
      specimen.expect(freight.lading).toEqual([]);
    });
  });

  specimen.describe("withUrl", () => {
    specimen.it("stores url and returns self", () => {
      const freight = new Freight("assets");
      const url = new Url("http://localhost:3000/attached/freight");
      const result = freight.withUrl(url);
      specimen.expect(result).toBe(freight);
      specimen.expect(freight.url).toBe(url);
    });
  });

  specimen.describe("index", () => {
    specimen.it("populates entries from directory", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.lading.length).toBe(6);
    });

    specimen.it("slug is filename without extension", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.lading.find((e) => e.path === "beep.mp3");
      specimen.expect(entry.slug).toBe("beep");
    });

    specimen.it("path is relative to freight root", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.lading.find((e) => e.slug === "deep");
      specimen.expect(entry.path).toBe("nested/deep.wav");
    });

    specimen.it("recurses into subdirectories", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.lading.find((e) => e.slug === "buried");
      specimen.expect(entry).toBeDefined();
      specimen.expect(entry.path).toBe("nested/deeper/buried.ogg");
    });

    specimen.it("mp3 maps to audio/mpeg", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.lading.find((e) => e.slug === "beep").type)
        .toBe("audio/mpeg");
    });

    specimen.it("png maps to image/png", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.lading.find((e) => e.slug === "icon").type)
        .toBe("image/png");
    });

    specimen.it("json maps to application/json", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.lading.find((e) => e.slug === "data").type)
        .toBe("application/json");
    });

    specimen.it("unknown extension maps to application/octet-stream", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.lading.find((e) => e.slug === "mystery").type)
        .toBe("application/octet-stream");
    });

    specimen.it("empty directory produces empty entries", async () => {
      const empty = await Deno.makeTempDir();
      const freight = new Freight(empty);
      await freight.index();
      specimen.expect(freight.lading).toEqual([]);
    });

    specimen.it("returns self for chaining", async () => {
      const d = await fixtures();
      const freight = new Freight(d);
      const result = await freight.index();
      specimen.expect(result).toBe(freight);
    });
  });

  specimen.describe("resolve", () => {
    specimen.it("finds by exact path", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.resolve("nested/deep.wav");
      specimen.expect(entry).toBeDefined();
      specimen.expect(entry.slug).toBe("deep");
    });

    specimen.it("finds by path without extension", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.resolve("nested/deep");
      specimen.expect(entry).toBeDefined();
      specimen.expect(entry.slug).toBe("deep");
    });

    specimen.it("finds by slug", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.resolve("beep");
      specimen.expect(entry).toBeDefined();
      specimen.expect(entry.path).toBe("beep.mp3");
    });

    specimen.it("path match takes priority over slug", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      const entry = freight.resolve("nested/deep");
      specimen.expect(entry.path).toBe("nested/deep.wav");
    });

    specimen.it("returns undefined for missing", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.resolve("nonexistent")).toBeUndefined();
    });
  });

  specimen.describe("catalog", () => {
    specimen.it("keys are full paths with extension", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      freight.withUrl(new Url("http://localhost:3000/freight"));
      const catalog = freight.catalog;
      specimen.expect(catalog["beep.mp3"]).toBeDefined();
      specimen.expect(catalog["nested/deep.wav"]).toBeDefined();
      specimen.expect(catalog["nested/deeper/buried.ogg"]).toBeDefined();
    });

    specimen.it("values have type and url", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      freight.withUrl(new Url("http://localhost:3000/freight"));
      const catalog = freight.catalog;
      specimen.expect(catalog["beep.mp3"].type).toBe("audio/mpeg");
      specimen.expect(catalog["beep.mp3"].url).toContain("beep.mp3");
    });

    specimen.it("url branches freight url by entry path", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      freight.withUrl(new Url("http://localhost:3000/freight"));
      specimen.expect(freight.catalog["nested/deep.wav"].url)
        .toBe("http://localhost:3000/freight/nested/deep.wav");
    });

    specimen.it("url is null when withUrl not called", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      specimen.expect(freight.catalog["beep.mp3"].url).toBeNull();
    });

    specimen.it("includes all indexed entries", async () => {
      const d = await fixtures();
      const freight = await indexed(d);
      freight.withUrl(new Url("http://localhost:3000/freight"));
      specimen.expect(Object.keys(freight.catalog).length)
        .toBe(freight.lading.length);
    });
  });
});
