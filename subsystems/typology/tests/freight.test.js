import { specimen, Url, Freight } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const stow = async (freight, root) => {
  const files = await paladin.find.walk(/./)(root);
  return freight.stow(files.map((file) => file.absolute.slice(root.length + 1)));
};

specimen.describe("Freight", () => {
  specimen.it("a freight wraps a path and keeps its identity", () => {
    const freight = new Freight("assets/audio");
    specimen.expect(freight.path.nature).toBe("/assets/audio");
    specimen.expect(freight.lading).toEqual([]);
    specimen.expect(new Freight(freight)).toBe(freight);

    const url = new Url("http://localhost:3000/attached/freight");
    specimen.expect(freight.withUrl(url)).toBe(freight);
    specimen.expect(freight.url).toBe(url);
  });

  specimen.it("a stow folds walked paths into lading, sorted", async () => {
    const directory = await Deno.makeTempDir();
    await Deno.writeFile(`${directory}/beep.mp3`, new Uint8Array([0xff, 0xfb]));
    await Deno.writeFile(`${directory}/icon.png`, new Uint8Array([0x89, 0x50]));
    await Deno.writeFile(`${directory}/data.json`, new TextEncoder().encode("{}"));
    await Deno.writeFile(`${directory}/mystery.xyz`, new Uint8Array([0x00]));
    await Deno.mkdir(`${directory}/nested/deeper`, { recursive: true });
    await Deno.writeFile(`${directory}/nested/deep.wav`, new Uint8Array([0x52, 0x49]));
    await Deno.writeFile(`${directory}/nested/deeper/buried.ogg`, new Uint8Array([0x4f, 0x67]));

    const freight = new Freight(directory);
    specimen.expect(await stow(freight, directory)).toBe(freight);
    specimen.expect(freight.lading.length).toBe(6);
    specimen.expect(freight.lading.find((entry) => entry.path === "beep.mp3").slug).toBe("beep");
    specimen.expect(freight.lading.find((entry) => entry.slug === "deep").path).toBe("nested/deep.wav");

    const buried = freight.lading.find((entry) => entry.slug === "buried");
    specimen.expect(buried).toBeDefined();
    specimen.expect(buried.path).toBe("nested/deeper/buried.ogg");

    specimen.expect(freight.lading.find((entry) => entry.slug === "beep").type).toBe("audio/mpeg");
    specimen.expect(freight.lading.find((entry) => entry.slug === "icon").type).toBe("image/png");
    specimen.expect(freight.lading.find((entry) => entry.slug === "data").type).toBe("application/json");
    specimen.expect(freight.lading.find((entry) => entry.slug === "mystery").type).toBe("application/octet-stream");

    specimen.expect(freight.lading.map((entry) => entry.path))
      .toEqual([...freight.lading.map((entry) => entry.path)].sort());

    const emptyRoot = await Deno.makeTempDir();
    const empty = await stow(new Freight(emptyRoot), emptyRoot);
    specimen.expect(empty.lading).toEqual([]);

    await Deno.mkdir(`${directory}/bak`, { recursive: true });
    await Deno.writeFile(`${directory}/bak/stale.mp3`, new Uint8Array([0xff]));
    const skipped = await stow(new Freight(directory), directory);
    specimen.expect(skipped.lading.map((entry) => entry.slug)).not.toContain("stale");
  });

  specimen.it("a query resolves by path or slug", async () => {
    const directory = await Deno.makeTempDir();
    await Deno.writeFile(`${directory}/beep.mp3`, new Uint8Array([0xff, 0xfb]));
    await Deno.mkdir(`${directory}/nested`, { recursive: true });
    await Deno.writeFile(`${directory}/nested/deep.wav`, new Uint8Array([0x52, 0x49]));
    const freight = await stow(new Freight(directory), directory);

    const exact = freight.resolve("nested/deep.wav");
    specimen.expect(exact).toBeDefined();
    specimen.expect(exact.slug).toBe("deep");

    const extensionless = freight.resolve("nested/deep");
    specimen.expect(extensionless).toBeDefined();
    specimen.expect(extensionless.slug).toBe("deep");
    specimen.expect(extensionless.path).toBe("nested/deep.wav");

    const slugged = freight.resolve("beep");
    specimen.expect(slugged).toBeDefined();
    specimen.expect(slugged.path).toBe("beep.mp3");

    specimen.expect(freight.resolve("nonexistent")).toBeUndefined();
  });

  specimen.it("a catalog addresses every entry on the wire", async () => {
    const directory = await Deno.makeTempDir();
    await Deno.writeFile(`${directory}/beep.mp3`, new Uint8Array([0xff, 0xfb]));
    await Deno.mkdir(`${directory}/nested/deeper`, { recursive: true });
    await Deno.writeFile(`${directory}/nested/deep.wav`, new Uint8Array([0x52, 0x49]));
    await Deno.writeFile(`${directory}/nested/deeper/buried.ogg`, new Uint8Array([0x4f, 0x67]));
    const freight = await stow(new Freight(directory), directory);

    specimen.expect(freight.catalog["beep.mp3"].url).toBeNull();

    freight.withUrl(new Url("http://localhost:3000/freight"));
    const catalog = freight.catalog;
    specimen.expect(catalog["beep.mp3"]).toBeDefined();
    specimen.expect(catalog["nested/deep.wav"]).toBeDefined();
    specimen.expect(catalog["nested/deeper/buried.ogg"]).toBeDefined();
    specimen.expect(catalog["beep.mp3"].type).toBe("audio/mpeg");
    specimen.expect(catalog["beep.mp3"].url).toContain("beep.mp3");
    specimen.expect(catalog["nested/deep.wav"].url).toBe("http://localhost:3000/freight/nested/deep.wav");
    specimen.expect(Object.keys(catalog).length).toBe(freight.lading.length);
  });
});
