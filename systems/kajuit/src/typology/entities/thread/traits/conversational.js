import { atom } from "nanostores";
import { Vector, Queue, Conversation, soma } from "@vivalence/typology";

// let boxRef = null;
let terminalsRef = null;
// const audioTeardowns = new WeakMap();

export function provide({ /* box, */ terminals }) {
  // boxRef = box;
  terminalsRef = terminals;
}

async function open(thread) {
  if (thread.conversation) return;

  const connection = thread.mode?.connection;
  const authority = thread.daemon?.lighthouse?.$authority;
  if (!connection || !authority) return;

  thread.streams = thread.streams ?? {};
  thread.streams.dialogue = new Queue();

  thread.$streaming ??= atom(null);
  thread.$pending ??= atom(false);

  let assistantTurn = null;
  let cancelled = false;
  const turnRepo = thread.daemon?.entities?.turn;
  const inbound = new Vector();

  thread._cancelStream = () => {
    cancelled = true;
    assistantTurn = null;
    thread.$streaming.set(null);
    thread.$pending.set(false);
  };

  inbound.open("/dialogue/packet", (pctx) => {
    if (cancelled) return;
    thread.streams.dialogue?.enqueue?.(pctx.input);
    assistantTurn = soma.pour(assistantTurn, pctx.input);

    const text = (assistantTurn?.parts ?? [])
      .filter((part) => part?.type === "text")
      .map((part) => part.text)
      .join("");

    thread.$pending.set(false);
    thread.$streaming.set({
      role: assistantTurn?.role ?? "assistant",
      parts: assistantTurn?.parts ?? [],
      text,
      meta: assistantTurn?.meta ?? null,
    });

    if (pctx.input.event === "/turn/close" && assistantTurn && turnRepo) {
      turnRepo.merge({
        id: assistantTurn.id ?? `tmp-asst-${Date.now()}`,
        role: assistantTurn.role ?? "assistant",
        parts: assistantTurn.parts ?? [],
        meta: assistantTurn.meta ?? null,
        thread: thread.id,
        createdAt: new Date().toISOString(),
      });
      assistantTurn = null;
      thread.$streaming.set(null);
    }
  });

  inbound.open("/dialogue/close", async () => {
    thread.streams.dialogue?.close?.();
    assistantTurn = null;
    cancelled = false;
    thread.$streaming.set(null);
    thread.$pending.set(false);
    if (!turnRepo) return;
    try {
      await turnRepo.find({ thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      const all = turnRepo.$entities.get();
      for (const turn of all) {
        if (typeof turn.id !== "string" || !turn.id.startsWith("tmp-")) continue;
        const ref = turn.thread;
        if (ref === thread || ref?.id === thread.id || ref === thread.id) {
          turnRepo.drop(turn.id);
        }
      }
    } catch (error) {
      console.error("[CONVERSATIONAL] turn refresh failed:", error);
    }
  });

  inbound.open("/dialogue/error", (pctx) => {
    console.error("[CONVERSATIONAL] dialogue error:", pctx.input);
    assistantTurn = null;
    thread.$streaming.set(null);
    thread.$pending.set(false);
    thread.$lastError ??= atom(null);
    thread.$lastError.set(pctx.input?.message ?? "stream error");
  });

  // inbound.open("/speech/packet", () => {});
  // inbound.open("/speech/abort", () => {});
  // inbound.open("/speech/close", () => {});
  // inbound.open("/verbatim/packet", () => {});
  // inbound.open("/verbatim/close", () => {});

  thread.socket = connection.socket("/conversation", inbound, {
    token: authority.get()?.access,
  });
  thread.conversation = new Conversation(inbound, thread.socket);

  try {
    await thread.conversation.open();
    // attachAudio(thread);
  } catch (error) {
    console.error("[CONVERSATIONAL] handshake failed:", error);
    thread.conversation = null;
    thread.socket = null;
    thread.streams.dialogue = null;
  }
}

function close(thread) {
  // detachAudio(thread);
  thread.conversation?.close?.();
  thread.conversation = null;
  thread.socket = null;
  if (thread.streams) thread.streams.dialogue = null;
  thread.$streaming?.set?.(null);
  thread.$pending?.set?.(false);
}

export function wire(thread) {
  thread.$streaming ??= atom(null);
  thread.$pending ??= atom(false);
  thread.$lastError ??= atom(null);

  const live = () =>
    thread.traits.includes("CONVERSATIONAL") && terminalsRef?.$thread?.get?.() === thread;

  let attempts = 0;
  const reconcile = () => {
    if (live() && !thread.conversation) {
      attempts = 0;
      open(thread);
    } else if (!live() && thread.conversation) {
      close(thread);
    }
  };

  let unsocket = null;
  const unconv = thread.$conversation.subscribe((conversation) => {
    unsocket?.();
    unsocket = conversation?.socket?.$state.subscribe((state) => {
      if (state === "OPEN") return void (attempts = 0);
      if (state !== "CLOSED" && state !== "ERROR") return;
      if (thread.conversation === conversation) thread.conversation = null;
      if (live() && attempts++ < 4) open(thread);
    });
  });

  const untrait = thread.$traits.subscribe(reconcile);
  const unactive = terminalsRef?.$thread?.subscribe?.(reconcile) ?? (() => {});

  return () => {
    untrait();
    unactive();
    unconv();
    unsocket?.();
  };
}

export async function engage(thread) {
  if (!thread || thread.traits.includes("CONVERSATIONAL")) return;
  const next = [...thread.traits, "CONVERSATIONAL"];
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { traits: next });
  thread.traits = next;
}

export async function release(thread) {
  if (!thread || !thread.traits.includes("CONVERSATIONAL")) return;
  const next = thread.traits.filter((t) => t !== "CONVERSATIONAL");
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { traits: next });
  thread.traits = next;
}

export function send(thread, parts, { tune } = {}) {
  if (!thread?.conversation?.send?.dialogue?.open) return false;
  thread.$pending?.set?.(true);
  thread.$lastError?.set?.(null);
  thread.conversation.send.dialogue.open({
    thread: thread.id,
    parts,
    ...(tune ? { tune } : {}),
  });
  return true;
}

export function abort(thread, turnId = undefined) {
  if (!thread) return false;
  thread._cancelStream?.();
  if (thread.conversation?.send?.dialogue?.abort) {
    thread.conversation.send.dialogue.abort(turnId ? { turn: turnId } : {});
  }
  return true;
}

/*
function engageBox(box, thread, conversation) {
  const microphone = box.device.microphone;
  const speaker = box.device.speaker;

  microphone.claim().catch(() => {});
  speaker.claim().catch(() => {});

  const micTap = microphone.in.tap((frame) => {
    if (!conversation.send?.verbatim?.packet) return;
    conversation.send.verbatim.packet({
      audio: int16ToBase64(float32ToInt16(frame)),
    });
  });

  const speechSub = conversation.subscribe("/speech/packet", (packet) => {
    if (!packet?.audio) return;
    speaker.out.enqueue(int16ToFloat32(base64ToInt16(packet.audio)));
  });

  const abortSub = conversation.subscribe("/speech/abort", () => {
    speaker.flush();
  });

  return () => {
    micTap();
    speechSub();
    abortSub();
    speaker.flush();
    speaker.release();
    microphone.release();
  };
}

function float32ToInt16(float32) {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
}

function int16ToFloat32(int16) {
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;
  return float32;
}

function int16ToBase64(int16) {
  const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToInt16(b64) {
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(buffer);
}
*/

/*
function attachAudio(thread) {
  if (!boxRef || !terminalsRef || !thread.conversation?.$state) return;

  let engagement = null;
  const reconcile = () => {
    const isActive = terminalsRef.$thread.get() === thread;
    const isLive = thread.conversation?.$state.get() === "LIVE";
    if (isActive && isLive) {
      if (!engagement) engagement = engageBox(boxRef, thread, thread.conversation);
    } else if (engagement) {
      engagement();
      engagement = null;
    }
  };

  const stateUnsub = thread.conversation.$state.subscribe(reconcile);
  const activeUnsub = terminalsRef.$thread.subscribe(reconcile);

  audioTeardowns.set(thread, () => {
    engagement?.();
    stateUnsub();
    activeUnsub();
  });
}

function detachAudio(thread) {
  audioTeardowns.get(thread)?.();
  audioTeardowns.delete(thread);
}
*/
