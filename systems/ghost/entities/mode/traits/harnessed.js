import { shape, is } from "@vivalence/typology";
import { stream } from "../../../gestalten/belt/harness.js";
import { dictate } from "../../../gestalten/commands/content/dictate.js";
import { call } from "../../../gestalten/commands/content/call.js";
import { mic } from "../../../gestalten/commands/content/mic.js";
import { polish } from "../../../gestalten/commands/content/polish.js";

export const HARNESSED = async (mode, die) => {
  const { repositoryMap } = die.client.runtime.entities.em;

  const merge = async (yielded) => {
    for (const [name, pojos] of Object.entries(yielded.product)) {
      if (!Array.isArray(pojos) || !Object.hasOwn(repositoryMap, name)) continue;
      yielded.product[name] = await Promise.all(pojos.map((pojo) => repositoryMap[name].merge(pojo)));
    }
  };

  const harness = mode.connection.branch("/harness").use(async (context, next) => {
    await next();
    const body = context.response?.body;
    if (body?.[Symbol.asyncIterator] && !body.getReader) {
      context.response.body = (async function* () {
        for await (const packet of body) {
          if (packet?.event === "/turn/full")
            for (const part of packet.turn.parts.filter((held) => held.type === "tool_result")) await merge(part);
          yield packet;
        }
      })();
      return;
    }
    if (!is.yieldish(body)) return;
    await merge(body);
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");
  mode.harness = shape.connection.wire(harness, mode.metadata.harness.references);
  if (mode.harness.verbatim) mode.repl.graft(dictate, polish);
  if (mode.harness.call) mode.repl.graft(call);
  if (mode.harness.verbatim || mode.harness.call) mode.repl.graft(mic);

  mode.repl.open(
    { nature: "/harness", rank: "hidden", valence: "a turn to the attached mode's harness on the terminal's thread. Example: /harness ciao" },
    (ctx) => stream(mode, ctx.terminal, [{ type: "text", text: ctx.signal.body.map((datum) => String(datum)).join(" ") }]),
  );
};
