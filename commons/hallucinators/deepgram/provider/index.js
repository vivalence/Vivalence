import { Queue, pcm } from "@vivalence/typology";

function line(url, protocols) {
  const ws = new WebSocket(url, protocols);
  const inbox = new Queue();
  let fault = null;
  ws.addEventListener("message", (event) => {
    try {
      inbox.enqueue(JSON.parse(event.data));
    } catch {}
  });
  ws.addEventListener("close", (event) => {
    if (event.code !== 1000 && event.code !== 1005)
      fault ??= new Error(`[deepgram] socket closed ${event.code}${event.reason ? ` ${event.reason}` : ""}`);
    inbox.close();
  });
  ws.addEventListener("error", () => {
    fault ??= new Error("[deepgram] socket failed");
    inbox.close();
  });
  return { ws, inbox, failed: () => fault };
}

const opened = (ws) =>
  new Promise((open, fail) => {
    ws.addEventListener("open", open, { once: true });
    ws.addEventListener("error", fail, { once: true });
  });

async function pump(ws, audioSource, close) {
  try {
    for await (const packet of audioSource) {
      if (ws.readyState !== WebSocket.OPEN) break;
      ws.send(pcm.bytes(packet.audio));
    }
  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(close));
  }
}

export async function* transcribe(url, protocols, audioSource, translate, close) {
  const { ws, inbox, failed } = line(url, protocols);
  await opened(ws);
  let broken = null;
  const feeding = pump(ws, audioSource, close).catch((fault) => {
    broken = fault;
    if (ws.readyState === WebSocket.OPEN) ws.close();
  });
  try {
    for await (const data of inbox.drain()) yield* translate(data);
    const fault = broken ?? failed();
    if (fault) throw fault;
  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.close();
    await feeding;
  }
}

const word = (entry) => ({
  word: entry.word ?? entry.punctuated_word,
  ...(entry.start !== undefined && { start: entry.start }),
  ...(entry.end !== undefined && { end: entry.end }),
  ...(entry.confidence !== undefined && { confidence: entry.confidence }),
  ...(entry.language && { language: entry.language }),
});

export function* nova(data) {
  if (data.type === "SpeechStarted") yield { event: "/turn/open", turn: { role: "user" } };
  if (data.type === "UtteranceEnd") yield { event: "/turn/close" };
  const alternative = data.channel?.alternatives?.[0];
  if (!alternative?.transcript) return;
  yield {
    event: data.is_final ? "/verbatim/final" : "/verbatim/partial",
    transcript: alternative.transcript,
    ...(data.is_final && alternative.words?.length && { words: alternative.words.map(word) }),
  };
}

export function* flux(data) {
  const kind = data.event ?? data.type;
  const transcript = data.transcript ?? "";
  switch (kind) {
    case "StartOfTurn":
      yield { event: "/turn/open", turn: { role: "user" } };
      if (transcript) yield { event: "/verbatim/partial", transcript };
      return;
    case "Update":
      if (transcript) yield { event: "/verbatim/partial", transcript };
      return;
    case "EagerEndOfTurn":
      yield { event: "/verbatim/eager", transcript };
      return;
    case "TurnResumed":
      yield { event: "/verbatim/resume" };
      return;
    case "EndOfTurn":
      yield {
        event: "/verbatim/final",
        transcript,
        ...(data.words?.length && { words: data.words.map(word) }),
      };
      yield { event: "/turn/close" };
      return;
  }
}

export default async function provider(service) {
  const apiKey = service.secrets.key;
  const protocols = ["token", apiKey];

  const novaFaculty = () => ({
    type: "verbatim",
    tune: [0.5, 0.1, 0.9, 0.6],
    context: 0,
    channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
    config: { model: "nova-3", language: "multi" },
    via: {
      stream: (audioSource, config = {}) =>
        transcribe(
          `wss://api.deepgram.com/v1/listen?` +
            `model=nova-3&encoding=linear16&sample_rate=16000&` +
            `language=${config.language ?? "multi"}&` +
            `interim_results=true&punctuate=true&vad_events=true&` +
            `utterance_end_ms=${config.utteranceEnd ?? 1000}&endpointing=${config.endpointing ?? 100}`,
          protocols,
          audioSource,
          nova,
          { type: "CloseStream" },
        ),
    },
  });

  const fluxFaculty = () => ({
    type: "verbatim",
    tune: [0.6, 0.2, 0.8, 0.4],
    context: 0,
    channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
    config: { model: "flux-general-multi", turns: true },
    via: {
      stream: (audioSource, config = {}) =>
        transcribe(
          `wss://api.deepgram.com/v2/listen?` +
            `model=flux-general-multi&encoding=linear16&sample_rate=16000&` +
            `eot_threshold=${config.eotThreshold ?? 0.7}` +
            (config.eagerThreshold ? `&eager_eot_threshold=${config.eagerThreshold}` : "") +
            (config.eotTimeout ? `&eot_timeout_ms=${config.eotTimeout}` : "") +
            (config.hints ?? []).map((hint) => `&language_hint=${hint}`).join(""),
          protocols,
          audioSource,
          flux,
          { type: "CloseStream" },
        ),
    },
  });

  return [novaFaculty(), fluxFaculty()];
}
