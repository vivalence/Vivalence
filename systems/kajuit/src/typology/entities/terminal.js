import { atom } from "nanostores";
import { LocalRepository, Vector, Session, Queue, bell } from "@vivalence/typology";
import { traits } from "@vivalence/kajuit";

const DEFAULT_DOCK = {
  side: "right",
  share: 0.32,
  collapsed: true,
  session: "ended",
};

export class Terminal {
  id = null;
  slug = null;
  daemon = null;
  $thread = atom(null);
  $dock = atom({ ...DEFAULT_DOCK });
  $audio = atom({ mic: "idle", speaker: "silent", vad: false });
  session = null;
  streams = null;
  audio = null;

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

  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      daemon: this.daemon?.slug ?? this.daemon,
      thread: this.thread?.id ?? this.thread,
    };
  }

  async engage(thread) {
    if (!thread) return;
    if (!thread.traits?.includes?.("INSITU")) {
      const traits = [...(thread.traits ?? []), "INSITU"];
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { traits });
      thread.traits = traits;
    }
    this.$thread.set(null);
    this.$thread.set(thread);
    this.$dock.set({ ...this.$dock.get(), session: "live", collapsed: false });
  }

  release() {
    this.session?.close?.();
    this.$dock.set({ ...this.$dock.get(), session: "ended" });
  }
}

export const TerminalDossier = {
  name: "terminal",
  kind: () => Terminal,
  repository: (dossier, quarters) =>
    new LocalRepository({ kind: dossier.kind(), persist: "viva.quarters" }),
  use: [
    async (ctx, next) => {
      // console.log("TERMINAL");
      await next();
    },
    ...Object.values(traits.terminal),
  ],
};

// async function wireAudio(terminal, thread) {if (!bell.claim(terminal)) {console.warn("[TerminalDossier] BELL busy — audio skipped"); return null;} try {await bell.micStart();} catch (error) {console.error("[TerminalDossier] mic start failed:", error); bell.release(terminal); return null;} const untapMic = bell.mic.tap((audio) => terminal.session.send.verbatim?.packet?.({audio, participantId: thread.mode.id,}),); (async () => {for await (const packet of terminal.streams.speech.drain()) {bell.speaker.enqueue(packet.audio);}})(); const unsubVad = bell.vad.$speaking.subscribe((speaking) => {terminal.$audio.set({ ...terminal.$audio.get(), vad: speaking }); if (speaking && terminal.$audio.get().speaker === "playing") {bell.speakerStop(); terminal.session.send.control?.abort?.({});}}); const unsubInputLevel = bell.$inputLevel.subscribe((level) => terminal.$audio.set({ ...terminal.$audio.get(), inputLevel: level }),); terminal.$audio.set({ mic: "capturing", speaker: "silent", vad: false }); return {teardown() {untapMic(); unsubVad(); unsubInputLevel(); bell.release(terminal); terminal.$audio.set({ mic: "idle", speaker: "silent", vad: false });},};}
