import { specimen } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

specimen.describe("state.store — bytes land once", () => {
  specimen.it("writes fresh bytes, skips identical bytes, replaces changed bytes", async () => {
    const directory = await Deno.makeTempDir();
    const file = `${directory}/nested/beep.mp3`;
    const bytes = new Uint8Array([0xff, 0xfb, 0x90, 0x00]);

    specimen.expect(await paladin.state.store(file, bytes)).toBe(true);
    specimen.expect(await Deno.readFile(file)).toEqual(bytes);

    specimen.expect(await paladin.state.store(file, new Uint8Array(bytes))).toBe(false);

    const changed = new Uint8Array([0xff, 0xfb, 0x90, 0x01]);
    specimen.expect(await paladin.state.store(file, changed)).toBe(true);
    specimen.expect(await Deno.readFile(file)).toEqual(changed);

    const longer = new Uint8Array([0xff, 0xfb]);
    specimen.expect(await paladin.state.store(file, longer)).toBe(true);
    specimen.expect(await Deno.readFile(file)).toEqual(longer);
  });
});
