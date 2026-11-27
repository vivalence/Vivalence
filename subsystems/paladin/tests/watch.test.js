import { basename, join } from "@std/path";
import { sleep, specimen } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const WINDOW = 600;

const AGED = 500;

const listening = async (directory) => {
  await sleep.ms(AGED);
  const bursts = [];
  const waiting = [];
  const stop = paladin.watch.directory(directory, (paths) => {
    bursts.push(paths.map((path) => basename(path)).sort());
    for (const resolve of waiting.splice(0)) resolve();
  });
  await sleep.ms(100);
  const next = () =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("no burst heard in 5000 ms")), 5000);
      waiting.push(() => (clearTimeout(timer), resolve()));
    });
  return { bursts, next, stop };
};

specimen.describe("paladin.watch — a directory's writes, heard once per settled burst", () => {
  specimen.it("two files written in one breath are ONE burst naming both; a later write is a second", async () => {
    const directory = await Deno.makeTempDir();
    const ear = await listening(directory);
    try {
      const first = ear.next();
      await Deno.writeTextFile(join(directory, "one.md"), "# one");
      await Deno.writeTextFile(join(directory, "two.md"), "# two");
      await first;
      specimen.expect(ear.bursts).toEqual([["one.md", "two.md"]]);

      const second = ear.next();
      await Deno.writeTextFile(join(directory, "one.md"), "# one, again");
      await second;
      specimen.expect(ear.bursts).toEqual([["one.md", "two.md"], ["one.md"]]);
    } finally {
      ear.stop();
    }
  });

  specimen.it("a write in a nested directory is heard; a temp file renamed into place names the file", async () => {
    const directory = await Deno.makeTempDir();
    await Deno.mkdir(join(directory, "articles"));
    const ear = await listening(directory);
    try {
      const burst = ear.next();
      await paladin.write.text(join(directory, "articles/nested.md"), "# nested");
      await burst;
      specimen.expect(ear.bursts.flat().includes("nested.md")).toBe(true);
    } finally {
      ear.stop();
    }
  });

  specimen.it("a read is no burst", async () => {
    const directory = await Deno.makeTempDir();
    await Deno.writeTextFile(join(directory, "held.md"), "# held");
    const ear = await listening(directory);
    try {
      await Deno.readTextFile(join(directory, "held.md"));
      await sleep.ms(WINDOW);
      specimen.expect(ear.bursts).toEqual([]);
    } finally {
      ear.stop();
    }
  });

  specimen.it("stopped, a write is heard by nobody, a burst still settling too", async () => {
    const directory = await Deno.makeTempDir();
    const ear = await listening(directory);
    await Deno.writeTextFile(join(directory, "late.md"), "# late");
    ear.stop();
    await Deno.writeTextFile(join(directory, "later.md"), "# later");
    await sleep.ms(WINDOW);
    specimen.expect(ear.bursts).toEqual([]);
  });
});
