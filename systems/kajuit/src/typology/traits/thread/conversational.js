import { atom } from "nanostores";
import { Vector, Queue, Conversation, soma } from "@vivalence/typology";

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

    if (pctx.input.event === "turn.close" && assistantTurn && turnRepo) {
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

  thread.socket = connection.socket("/conversation", inbound, {
    token: authority.get()?.access,
  });
  thread.conversation = new Conversation(inbound, thread.socket);

  try {
    await thread.conversation.open();
  } catch (error) {
    console.error("[CONVERSATIONAL] handshake failed:", error);
    thread.conversation = null;
    thread.socket = null;
    thread.streams.dialogue = null;
  }
}

function close(thread) {
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
  return thread.$traits.subscribe((traits) => {
    const wants = traits.includes("CONVERSATIONAL");
    if (wants && !thread.conversation) open(thread);
    else if (!wants && thread.conversation) close(thread);
  });
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
