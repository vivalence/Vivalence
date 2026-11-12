import { pcm, Queue, v } from "@vivalence/typology";

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
    if (event.code !== 1000 && event.code !== 1005) {
      fault ??= new Error(
        `[deepgram] socket closed ${event.code}${
          event.reason ? ` ${event.reason}` : ""
        }`,
      );
    }
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
      ws.send(pcm.bytes(packet.audio.data));
    }
  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(close));
  }
}

export async function* transcribe(
  url,
  protocols,
  audioSource,
  translate,
  close,
  signal,
) {
  const { ws, inbox, failed } = line(url, protocols);
  signal.addEventListener("abort", () => ws.close(), { once: true });
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

const spoken = (languages = []) => (languages.length === 1 ? languages[0] : "multi");

const hinted = (languages = []) => languages.map((language) => `&language_hint=${language}`).join("");

export function nova() {
  let speaking = false;
  const onset = function* () {
    if (speaking) return;
    speaking = true;
    yield { event: "/turn/open", turn: { role: "user" } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  };
  return function* (data) {
    switch (data.type) {
      case "SpeechStarted":
        yield* onset();
        return;
      case "Results": {
        const [alternative] = data.channel.alternatives;
        if (!alternative.transcript) return;
        yield* onset();
        yield {
          event: data.is_final ? "/part/delta" : "/part/draft",
          index: 0,
          part: { text: alternative.transcript },
        };
        return;
      }
      case "UtteranceEnd":
        if (!speaking) return;
        yield { event: "/part/close", index: 0 };
        yield { event: "/turn/close", turn: {} };
        speaking = false;
        return;
    }
  };
}

export function* flux(data) {
  switch (data.event ?? data.type) {
    case "StartOfTurn":
      yield { event: "/turn/open", turn: { role: "user" } };
      yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
      return;
    case "Update":
      yield { event: "/part/draft", index: 0, part: { text: data.transcript } };
      return;
    case "EagerEndOfTurn":
      yield { event: "/turn/eager" };
      return;
    case "TurnResumed":
      yield { event: "/turn/resume" };
      return;
    case "EndOfTurn":
      yield { event: "/part/full", index: 0, part: { type: "text", text: data.transcript } };
      yield { event: "/part/close", index: 0 };
      yield { event: "/turn/close", turn: {} };
      return;
  }
}

const Verbatim = v.object({
  type: v.const("verbatim"),
  id: v.string(),
  model: v.string(),
  tune: v.primitives.hallucination.Tune,
});

const Faculties = v.array(Verbatim);

export default async function provider(service) {
  const [violation] = v.faults(Faculties, service.faculties);
  if (violation) throw new Error(`[deepgram] faculties${violation.at} ${violation.reason}`);
  const apiKey = service.secrets.key;
  const protocols = ["token", apiKey];

  const novaFaculty = (entry) => ({
    type: "verbatim",
    id: entry.id,
    tune: entry.tune,
    context: 0,
    channels: {
      in: [{ type: "audio", codec: "pcm_16000" }],
      out: [{ type: "event" }],
    },
    config: { language: [] },
    via: {
      stream: ({ source, settings = {} }, { signal } = {}) =>
        transcribe(
          `wss://api.deepgram.com/v1/listen?` +
            `model=${entry.model}&encoding=linear16&sample_rate=16000&` +
            `language=${spoken(settings.language)}&` +
            `interim_results=true&punctuate=true&vad_events=true&` +
            `utterance_end_ms=${settings.utteranceEnd ?? 1000}&endpointing=${
              settings.endpointing ?? 100
            }`,
          protocols,
          source,
          nova(),
          { type: "CloseStream" },
          signal,
        ),
    },
  });

  const fluxFaculty = (entry) => ({
    type: "verbatim",
    id: entry.id,
    tune: entry.tune,
    context: 0,
    channels: {
      in: [{ type: "audio", codec: "pcm_16000" }],
      out: [{ type: "event" }],
    },
    config: { turns: true },
    via: {
      stream: ({ source, settings = {} }, { signal } = {}) =>
        transcribe(
          `wss://api.deepgram.com/v2/listen?` +
            `model=${entry.model}&encoding=linear16&sample_rate=16000&` +
            `eot_threshold=${settings.eotThreshold ?? 0.7}` +
            (settings.eagerThreshold
              ? `&eager_eot_threshold=${settings.eagerThreshold}`
              : "") +
            (settings.eotTimeout ? `&eot_timeout_ms=${settings.eotTimeout}` : "") +
            hinted(settings.language),
          protocols,
          source,
          flux,
          { type: "CloseStream" },
          signal,
        ),
    },
  });

  const FAMILIES = [
    [(entry) => entry.model.startsWith("flux"), fluxFaculty],
    [() => true, novaFaculty],
  ];

  return service.faculties.map((entry) =>
    FAMILIES.find(([matches]) => matches(entry))[1](entry)
  );
}
