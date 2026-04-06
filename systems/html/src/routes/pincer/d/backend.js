export function createDataspace() {
  const daemons = new Map();

  daemons.set("viva", {
    slug: "viva",
    manifest: { name: "vivalence" },
    modes: [
      {
        slug: "flashcard",
        manifest: { name: "Flashcard" },
        intents: [
          { slug: "feed",   manifest: { name: "feed"   } },
          { slug: "review", manifest: { name: "review" } },
        ],
      },
      {
        slug: "write",
        manifest: { name: "Write" },
        intents: [
          { slug: "feed", manifest: { name: "feed" } },
        ],
      },
    ],
  });

  daemons.set("cortex", {
    slug: "cortex",
    manifest: { name: "cortex" },
    modes: [
      {
        slug: "dewey",
        manifest: { name: "Dewey" },
        intents: [
          { slug: "chat", manifest: { name: "chat" } },
        ],
      },
    ],
  });

  return { daemons };
}

export function createTerminal() {
  return {
    daemon: null,
    mode:   null,
    intent: null,
    mount(patch) {
      for (const key of ["daemon", "mode", "intent"]) {
        if (key in patch) this[key] = patch[key];
      }
    },
    toString() {
      return `T[${this.daemon?.slug ?? "_"}/${this.mode?.slug ?? "_"}/${this.intent?.slug ?? "_"}]`;
    },
  };
}

export function createPincer() {
  return { dPhase: "outside" };
}
