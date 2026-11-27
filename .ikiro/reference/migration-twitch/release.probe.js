import { EntitySchema } from "@mikro-orm/core";
import { Path, Twitch } from "@vivalence/typology";
import { belt } from "@vivalence/typology";
import { provider } from "../../../commons/datamaps/libsql/libsql.viva.js";

const Thing = new EntitySchema({
  name: "Thing",
  properties: { id: { type: "number", primary: true }, word: { type: "string" } },
});

const STEPS = ["2026.11.0", "2026.11.1", "2026.12.0", "2027.01.0", "2027.01.9", "2027.01.10"];

const world = async () => {
  const home = await Deno.makeTempDir({ prefix: "viva-release-probe-" });
  const boot = async (version) => {
    const heard = [];
    const twitch = new Twitch();
    for (const release of STEPS) {
      twitch.open(`/before/datamap/migrate/${release}`, () => heard.push(`before ${release}`));
      twitch.open(`/after/datamap/migrate/${release}`, () => heard.push(`after ${release}`));
    }
    const datamap = {
      mountpoint: new Path(home),
      statics: { db: { file: "probe.viva.db" } },
      version,
    };
    const held = await provider(datamap, { twitch, entities: [Thing] });
    const stamps = await held.orm.em
      .getConnection()
      .execute("select name from _mikro_migrations order by id");
    await held.orm.close();
    return { version, heard, stamps: stamps.map((stamp) => stamp.name.split("_").at(-1)) };
  };
  return { home, boot };
};

const show = (title, result) => console.log(`\n== ${title}\n${JSON.stringify(result)}`);

const fresh = await world();
show("1 · fresh mount on 2027.01.0", await fresh.boot("2027.01.0"));
show("2 · second boot on 2027.01.0", await fresh.boot("2027.01.0"));

const stamped = await world();
show("3a · fresh mount on 2026.11.0", await stamped.boot("2026.11.0"));
show("3b · it boots on 2026.11.1", await stamped.boot("2026.11.1"));
show("3c · it skips to 2027.01.10", await stamped.boot("2027.01.10"));

for (const written of ["2026.11.1", "2027.01.0", "0.0.0", "1.4.2", "v2026.11.1", "2026.11"]) {
  try {
    belt.release.parse(written);
    console.log(`parse ${written} ok`);
  } catch (fault) {
    console.log(`parse ${written} THROWS ${fault.message}`);
  }
}

for (const made of [fresh, stamped]) await Deno.remove(made.home, { recursive: true });
