import { Vector, shape, steer } from "@vivalence/typology";
import * as narrow from "../../../../typology/gestalten/belt/narrow.js";

export { narrow };

export async function compose(lighthouse, top) {
  const daemons = lighthouse.$daemons.get();

  const threadsVector = new Vector();
  const modesVector = new Vector();
  const intentsVector = new Vector();

  for (const daemon of daemons) {
    if (daemon.entities?.thread) {
      const found = await daemon.entities.thread.find({}, { populate: ["mode", "intent"] });
      for (const thread of found) {
        daemon.entities.thread.resolve?.(thread);
        const label = thread.label ?? {};
        threadsVector.open(
          {
            nature: label.name ?? thread.mode?.slug ?? thread.id,
            valence: { name: label.description ?? "", prompt: thread.mode?.type ?? daemon.slug },
          },
          () => resume(top, thread),
        );
      }
    }

    for (const mode of daemon.entities.mode.$entities.get()) {
      const intents = mode.intents ?? [];
      if (intents.length > 0) {
        for (const intent of intents) {
          intentsVector.open(
            {
              nature: intent.slug,
              valence: {
                name: intent.name ?? intent.slug,
                prompt: mode.type + " · " + (mode.name ?? mode.slug),
              },
            },
            () => openFromIntent(top, daemon, mode, intent),
          );
        }
      }

      if (mode.implements("selfevident")) {
        modesVector.open(
          {
            nature: mode.slug,
            valence: { name: mode.name ?? mode.slug, prompt: mode.type },
          },
          () => openFromMode(top, daemon, mode),
        );
      }
    }
  }

  return {
    threads: shape.flat(threadsVector, steer.direct),
    intents: shape.flat(intentsVector, steer.direct),
    modes: shape.flat(modesVector, steer.direct),
  };
}

function resume(top, thread) {
  top.set(thread);
}

async function openFromMode(top, daemon, mode) {
  const thread = await daemon.entities.thread.create({ mode: mode.id });
  daemon.entities.thread.resolve?.(thread);
  top.set(thread);
}

async function openFromIntent(top, daemon, mode, intent) {
  const thread = await daemon.entities.thread.create({ mode: mode.id, intent: intent.id });
  daemon.entities.thread.resolve?.(thread);
  top.set(thread);
}
