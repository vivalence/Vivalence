import { Vector, shape, steer } from "@vivalence/typology";
import { narrow } from "@vivalence/kajuit";

export { narrow };

export async function compose(lighthouse, terminals) {
  const daemons = lighthouse.$daemons.get();

  const threadsVector = new Vector();
  const modesVector = new Vector();
  const intentsVector = new Vector();

  const harvested = [];

  for (const daemon of daemons) {
    if (!daemon.status.is("healthy")) continue;

    if (daemon.entities.thread) {
      const found = await daemon.entities.thread.find({}, { populate: ["mode", "intent"] });
      for (const thread of found) {
        if (thread.mode?.status?.is?.(["unavailable", "error"])) continue;
        daemon.entities.thread.resolve?.(thread);
        harvested.push({ thread, daemon });
      }
    }

    for (const mode of daemon.entities.mode.$entities.get()) {
      if (mode.status.is(["unavailable", "error"])) continue;
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
            () => openFromIntent(terminals, daemon, mode, intent),
          );
        }
      }

      if (mode.implements("selfevident")) {
        modesVector.open(
          {
            nature: mode.slug,
            valence: { name: mode.name ?? mode.slug, prompt: mode.type },
          },
          () => openFromMode(terminals, daemon, mode),
        );
      }
    }
  }

  // Newest first. updatedAt is an ISO timestamp, so lexical compare == chronological.
  harvested.sort((a, b) =>
    String(b.thread.updatedAt ?? "").localeCompare(String(a.thread.updatedAt ?? "")),
  );

  for (const { thread, daemon } of harvested) {
    const label = thread.label ?? {};
    threadsVector.open(
      {
        nature: label.name ?? thread.mode?.slug ?? thread.id,
        valence: { name: label.description ?? "", prompt: thread.mode?.type ?? daemon.slug },
      },
      () => resume(terminals, thread),
    );
  }

  return {
    threads: shape.flat(threadsVector, steer.direct),
    intents: shape.flat(intentsVector, steer.direct),
    modes: shape.flat(modesVector, steer.direct),
  };
}

function resume(terminals, thread) {
  terminals.active.thread = thread;
}

async function openFromMode(terminals, daemon, mode) {
  const thread = await daemon.entities.thread.create({ mode: mode.id });
  daemon.entities.thread.resolve?.(thread);
  terminals.active.thread = thread;
}

async function openFromIntent(terminals, daemon, mode, intent) {
  const thread = await daemon.entities.thread.create({ mode: mode.id, intent: intent.id });
  daemon.entities.thread.resolve?.(thread);
  terminals.active.thread = thread;
}
