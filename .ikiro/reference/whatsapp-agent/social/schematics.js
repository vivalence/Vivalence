import { v } from "@vivalence/typology";

const { Part } = v.primitives.hallucination;

export const About = v.object({
  id: v.string().desc("the earlier message's id on that platform").example("wamid.HBgM"),
  act: v
    .enum(["reply", "reaction", "edit", "delete"])
    .desc("what this message does to the earlier one")
    .example("reply"),
});

export const Message = v.object({
  platform: v.string().desc("the messenger it came in on").example("whatsapp"),
  id: v.string().desc("its id there, unique per platform").example("wamid.HBgN"),
  from: v.string().desc("the address a reply goes to").example("4915100000000"),
  name: v.string().desc("the sender's display name").example("Finn"),
  at: v.integer().desc("unix seconds, the platform's clock").example(1732440000),
  parts: v
    .array(v.union([Part.Text, Part.Image, Part.Audio, Part.Video, Part.Document, Part.Alien]))
    .desc("what it carries, in order; a kind the platform has and we do not is an alien part"),
  about: About.optional().desc("set when it acts on an earlier message; absent on a fresh one"),
});
