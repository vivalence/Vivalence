import { specimen, shape, shard, Vector } from "@vivalence/typology";
import { tools } from "../tools/index.js";

const tone = async () => {
  const dir = await Deno.makeTempDir();
  const out = `${dir}/tone.mp3`;
  await new Deno.Command("ffmpeg", {
    args: ["-y", "-f", "lavfi", "-i", "sine=frequency=440:duration=1", "-b:a", "128k", out],
  }).output();
  const bytes = await Deno.readFile(out);
  await Deno.remove(dir, { recursive: true });
  return bytes;
};

const literalOf = (row) => ({
  ...row,
  assign(data) {
    Object.assign(this, data);
  },
});

const rig = ({ synthesized }) => {
  const received = [];
  let flushed = 0;
  const literals = [
    literalOf({
      slug: "ho-fame",
      ontology: "sentence",
      traits: ["TRANSLATED", "RANKED"],
      trait: { RANKED: { rank: 5 }, TRANSLATED: { learning: "Ho fame.", known: "I am hungry." } },
    }),
    literalOf({
      slug: "grazie-mille",
      ontology: "sentence",
      traits: ["TRANSLATED", "RANKED", "VOCALIZED"],
      trait: { RANKED: { rank: 2 }, TRANSLATED: { learning: "Grazie mille.", known: "Thanks a lot." } },
    }),
  ];

  const topography = {
    slug: "english-to-italian",
    implements: () => true,
    datasink: { drain: async (input) => ({ drained: ["literal"], written: 1, input }) },
    freight: {
      receive: async (path, bytes) => (received.push({ path, size: bytes.length }), { path }),
    },
  };

  const daemon = {
    modes: { topography: { "english-to-italian": topography } },
    entities: {
      literal: {
        find: async (where) =>
          where?.slug ? literals.filter((held) => where.slug.$in.includes(held.slug)) : literals,
      },
      em: { flush: async () => flushed++ },
    },
    cortex: { hallucinate: { speech: { render: async () => synthesized } } },
  };

  const call = shape.object(new Vector().use(shard.context.bind("daemon", daemon)).slurp(tools));
  return { call, daemon, literals, received, flushed: () => flushed };
};

specimen.describe("harvest tools", () => {
  specimen.it("survey lists only the voiceless, ranked, as a bag with no message", async () => {
    const { call } = rig({ synthesized: new Uint8Array() });
    const report = await call.survey({});
    specimen.expect(report.message).toBe(undefined);
    specimen.expect(report.total).toBe(1);
    specimen.expect(report.targets[0]).toEqual({
      slug: "ho-fame",
      kind: "sentence",
      rank: 5,
      learning: "Ho fame.",
    });
  });

  specimen.it("dry vocalize resolves without touching freight or entities", async () => {
    const { call, received, flushed } = rig({ synthesized: new Uint8Array() });
    const report = await call.vocalize({ language: "ita", source: "tts", dry: true });
    specimen.expect(report.vocalized[0].slug).toBe("ho-fame");
    specimen.expect(report.vocalized[0].dry).toBe(true);
    specimen.expect(received).toEqual([]);
    specimen.expect(flushed()).toBe(0);
  });

  specimen.it("wet tts vocalize lands freight, stamps VOCALIZED with nested attribution, flushes", async () => {
    const { call, literals, received, flushed } = rig({ synthesized: await tone() });
    const report = await call.vocalize({ language: "ita", source: "tts" });

    specimen.expect(report.vocalized).toEqual([
      { slug: "ho-fame", path: "sentences/ho-fame.mp3", source: "tts", license: "synthetic" },
    ]);
    specimen.expect(received[0].path).toBe("sentences/ho-fame.mp3");
    specimen.expect(received[0].size).toBeGreaterThan(4000);

    const landed = literals[0];
    specimen.expect(landed.traits).toContain("VOCALIZED");
    specimen.expect(landed.trait.VOCALIZED.asset).toEqual({ path: "sentences/ho-fame.mp3" });
    specimen.expect(landed.trait.VOCALIZED.attribution).toEqual({
      author: "elevenlabs",
      license: "synthetic",
      source: "tts",
    });
    specimen.expect(flushed()).toBe(1);
  });

  specimen.it("drain routes to the topography's datasink", async () => {
    const { call } = rig({ synthesized: new Uint8Array() });
    const report = await call.drain({});
    specimen.expect(report.drained).toEqual(["literal"]);
    specimen.expect(report.input).toEqual({ all: true });
  });
});
