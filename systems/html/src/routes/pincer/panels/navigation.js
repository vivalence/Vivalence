import { Vector, stamp } from "@vivalence/typology";

// history
// modes
// intents
export async function compose(quarters, lighthouse, threadContext) {
  const daemons = lighthouse.$daemons.get();
  const vector = new Vector();

  const threadsBranch = vector.branch({
    nature: "threads",
    directed: { variant: "icon", icon: "history" },
  });

  for (const daemon of daemons) {
    if (!daemon.entities?.thread) continue;
    const found = await daemon.entities.thread.find({}, { populate: ["mode", "intent"] });
    for (const thread of found) {
      daemon.entities.thread.resolve?.(thread);
      threadsBranch.open({ nature: thread.mode?.slug ?? thread.id }, () =>
        resume(threadContext, thread),
      );
    }
  }

  vector.branch({ nature: "modes", directed: { variant: "icon", icon: "compass" } });
  for (const daemon of daemons) {
    // vector.branch("daemons").branch(daemon.slug);
    for (const mode of daemon.entities.mode.$entities.get()) {
      // console.log({ mode });
      if (mode.implements("selfevident")) {
        // console.log({ selfevident: mode });
        vector
          .branch("modes")
          .branch(daemon.slug)
          .branch(mode.type)
          .open(mode.slug, () => openFromMode(threadContext, daemon, mode));
      }

      // vector.branch({ nature: "daemons", directed: { variant: "icon", icon: "compass" } });
      // if mode trait selfevident -> attach openfrommode() to
      if (mode.intents?.size > 0) {
        for (const intent of mode.intents) {
          vector
            .branch("intents")
            .branch(daemon.slug)
            .branch(mode.type)
            .branch(mode.slug)
            .open(intent.slug, () => openFromIntent(threadContext, daemon, mode, intent));
        }
      }
    }
  }
  // console.log(JSON.stringify(stamp.press(vector), null, 2));

  return vector;
}

function resume(threadContext, thread) {
  threadContext.set(thread);
}

async function openFromMode(threadContext, daemon, mode) {
  const thread = await daemon.entities.thread.create({ mode: mode.id });
  daemon.entities.thread.resolve?.(thread);
  threadContext.set(thread);
}

async function openFromIntent(threadContext, daemon, mode, intent) {
  const thread = await daemon.entities.thread.create({ mode: mode.id, intent: intent.id });
  daemon.entities.thread.resolve?.(thread);
  threadContext.set(thread);
}

export function composeThread(thread) {
  const vector = new Vector();

  vector.open({ nature: "daemon", valence: { name: thread.daemon?.slug } });
  vector.open({ nature: "mode", valence: { name: thread.mode?.slug, prompt: thread.mode?.type } });
  if (thread.intent) {
    vector.open({
      nature: "intent",
      valence: { name: thread.intent?.slug, prompt: thread.intent?.type },
    });
  }
  if (thread.traits?.length) {
    vector.open({ nature: "traits", valence: { name: thread.traits.join(", ") } });
  }
  vector.open({ nature: "counter", valence: { name: String(thread.counter) } });
  vector.open({ nature: "cursor", valence: { name: String(thread.cursor) } });
  vector.open({ nature: "buffers", valence: { name: String(thread.buffers?.length ?? 0) } });
  vector.open({ nature: "turns", valence: { name: String(thread.turns?.length ?? 0) } });

  return vector;
}
