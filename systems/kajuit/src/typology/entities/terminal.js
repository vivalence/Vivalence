import { atom } from "nanostores";
import { LocalRepository } from "@vivalence/typology";

const DEFAULT_DOCK = {
  side: "right",
  share: 0.32,
};

const DEFAULT_COMPOSER = {
  enterSends: true,
  density: "comfortable",
};

export class Terminal {
  id = null;
  slug = null;
  daemon = null;
  $thread = atom(null);
  $dock = atom({ ...DEFAULT_DOCK });
  $composer = atom({ ...DEFAULT_COMPOSER });

  get thread() {
    return this.$thread.get();
  }
  set thread(value) {
    this.$thread.set(value);
  }

  get dock() {
    return this.$dock.get();
  }
  set dock(value) {
    this.$dock.set(value);
  }

  get composer() {
    return this.$composer.get();
  }
  set composer(value) {
    this.$composer.set({ ...DEFAULT_COMPOSER, ...(value ?? {}) });
  }

  get conversation() {
    return this.thread?.conversation ?? null;
  }

  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      daemon: this.daemon?.slug ?? this.daemon,
      thread: this.thread?.id ?? this.thread,
      dock: this.dock,
      composer: this.composer,
    };
  }
}

export const TerminalDossier = {
  name: "terminal",
  kind: () => Terminal,
  repository: (dossier, quarters) =>
    new LocalRepository({ kind: dossier.kind(), persist: "viva.quarters" }),
  use: [],
};
