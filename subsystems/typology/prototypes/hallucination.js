import { Vector, shape, shard, steer } from "@vivalence/typology";
import { Packet, Verbatim, Audio } from "../schematics/primitives/hallucination.js";

export function Hallucination(cortex) {
  const hallucinator = new Vector();

  for (const avenue of ["dialogue", "object"]) {
    hallucinator
      .branch(`/${avenue}`)
      .use(shard.hallucinate.lowering())
      .open({ nature: "stream", yields: Packet.Response }, shard.hallucinate.streaming(cortex, avenue))
      .open("render", shard.hallucinate.rendering(cortex, avenue));
  }

  hallucinator
    .branch("/verbatim")
    .use(shard.hallucinate.sourcing())
    .open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, shard.hallucinate.transcribing(cortex));

  hallucinator
    .branch("/speech")
    .use(shard.hallucinate.sourcing())
    .open({ nature: "stream", yields: Audio.Any }, shard.hallucinate.synthesizing(cortex))
    .open("render", shard.hallucinate.vocalizing(cortex));

  return shape.object(hallucinator, steer.strategy.echo);
}
