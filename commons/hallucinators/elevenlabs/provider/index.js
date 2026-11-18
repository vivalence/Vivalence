import { pcm, Queue, v } from "@vivalence/typology";

const RATE = 16000;

const SCRIBE = "wss://api.elevenlabs.io/v1/speech-to-text/realtime";

function socket(url, headers) {
  const ws = new WebSocket(url, { headers });
  const inbox = new Queue();
  let fault = null;
  ws.addEventListener("message", (event) => inbox.enqueue(event.data));
  ws.addEventListener("close", (event) => {
    if (event.code !== 1000 && event.code !== 1005) {
      fault ??= new Error(
        `[elevenlabs] socket closed ${event.code}${
          event.reason ? ` ${event.reason}` : ""
        }`,
      );
    }
    inbox.close();
  });
  ws.addEventListener("error", () => {
    fault ??= new Error("[elevenlabs] socket failed");
    inbox.close();
  });
  return { ws, inbox, failed: () => fault };
}

const opened = (ws) =>
  new Promise((open, fail) => {
    ws.addEventListener("open", open, { once: true });
    ws.addEventListener("error", fail, { once: true });
  });

const audioChunk = (audio, commit) =>
  JSON.stringify({
    message_type: "input_audio_chunk",
    audio_base_64: audio.data,
    commit,
    sample_rate: audio.rate,
  });

async function pump(ws, source, session) {
  for await (const packet of source) {
    if (ws.readyState !== WebSocket.OPEN) return;
    ws.send(audioChunk(packet.audio, false));
  }
  session.spent = true;
  if (ws.readyState !== WebSocket.OPEN) return;
  if (session.speaking) ws.send(audioChunk({ data: "", rate: RATE }, true));
  else ws.close();
}

function* onset(session) {
  if (session.speaking) return;
  session.speaking = true;
  yield { event: "/turn/open", turn: { role: "user" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
}

function* seal(session) {
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", turn: {} };
  session.speaking = false;
}

function* scribe(session, data) {
  switch (data.message_type) {
    case "partial_transcript":
      if (!session.speaking && !data.text) return;
      yield* onset(session);
      yield { event: "/part/draft", index: 0, part: { text: data.text } };
      return;
    case "committed_transcript":
      if (!session.speaking && !data.text) return;
      yield* onset(session);
      yield { event: "/part/delta", index: 0, part: { text: data.text } };
      yield* seal(session);
      return;
    case "commit_throttled":
      if (!session.spent) break;
      yield* seal(session);
      return;
  }
  if ("error" in data) throw new Error(`[elevenlabs] ${data.message_type}: ${data.error}`);
}

async function* hear(url, headers, source, signal) {
  const { ws, inbox, failed } = socket(url, headers);
  signal.addEventListener("abort", () => ws.close(), { once: true });
  await opened(ws);
  const session = { speaking: false, spent: false };
  let broken = null;
  const feeding = pump(ws, source, session).catch((fault) => {
    broken = fault;
    if (ws.readyState === WebSocket.OPEN) ws.close();
  });
  try {
    for await (const message of inbox.drain()) {
      yield* scribe(session, JSON.parse(message));
      if (session.spent && !session.speaking) return;
    }
    const fault = broken ?? failed();
    if (fault) throw fault;
  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.close();
    await feeding;
  }
}

const languageCode = (languages = []) =>
  languages.length === 1 ? `&language_code=${languages[0]}` : "";

const Speech = v.object({
  type: v.const("speech"),
  id: v.string(),
  model: v.string(),
  voice: v.string(),
  tune: v.primitives.hallucination.Tune,
});

const Verbatim = v.object({
  type: v.const("verbatim"),
  id: v.string(),
  model: v.string(),
  tune: v.primitives.hallucination.Tune,
});

const Faculties = v.array(v.union([Speech, Verbatim]));

export default async function provider(service) {
  const [violation] = v.faults(Faculties, service.faculties);
  if (violation) throw new Error(`[elevenlabs] faculties${violation.at} ${violation.reason}`);
  const apiKey = service.secrets.key;

  function makeSpeech(entry) {
    const render = async ({ source, settings = {} }, { signal } = {}) => {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${entry.voice}` +
        `?output_format=mp3_44100_128`;
      const res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: source,
          model_id: entry.model,
          voice_settings: {
            stability: settings.stability ?? 0.5,
            similarity_boost: settings.similarityBoost ?? 0.75,
          },
        }),
      });
      if (!res.ok) {
        throw new Error(
          `[elevenlabs] render ${res.status}: ${await res.text()}`,
        );
      }
      return new Uint8Array(await res.arrayBuffer());
    };

    const stream = async function* ({ source, settings = {} }, { signal } = {}) {
      const url =
        `wss://api.elevenlabs.io/v1/text-to-speech/${entry.voice}/stream-input` +
        `?model_id=${entry.model}&output_format=pcm_16000`;
      const { ws, inbox, failed } = socket(url);
      signal.addEventListener("abort", () => ws.close(), { once: true });
      await opened(ws);
      ws.send(JSON.stringify({
        text: " ",
        voice_settings: {
          stability: settings.stability ?? 0.5,
          similarity_boost: settings.similarityBoost ?? 0.75,
        },
        xi_api_key: apiKey,
      }));

      const pump = (async () => {
        try {
          const chunks = typeof source === "string" ? [source] : source;
          for await (const chunk of chunks) {
            if (ws.readyState !== WebSocket.OPEN) break;
            if (!chunk) continue;
            ws.send(
              JSON.stringify({ text: chunk, try_trigger_generation: true }),
            );
          }
        } finally {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ text: "" }));
          }
        }
      })();

      let samples = 0;
      try {
        for await (const message of inbox.drain()) {
          const data = JSON.parse(message);
          if (data.error) throw new Error(`[elevenlabs] speech ${data.error}: ${data.message}`);
          if (data.audio) {
            yield {
              event: "/audio/packet",
              pts: samples / RATE,
              audio: { data: data.audio, rate: RATE, codec: "pcm_16000" },
            };
            samples += pcm.bytes(data.audio).byteLength / 2;
          }
          if (data.isFinal) {
            yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
            return;
          }
        }
        const fault = failed();
        if (fault) throw fault;
      } finally {
        if (ws.readyState === WebSocket.OPEN) ws.close();
        await pump.catch(() => {});
      }
    };

    return {
      ...entry,
      type: "speech",
      id: entry.id,
      tune: entry.tune,
      context: 0,
      channels: {
        in: [{ type: "text" }],
        out: [{ type: "audio", codec: "pcm_16000" }, {
          type: "audio",
          codec: "mp3_44100_128",
        }],
      },
      via: { stream, render },
    };
  }

  function makeVerbatim(entry) {
    const transcribe = ({ source, settings = {} }, { signal } = {}) =>
      hear(
        `${SCRIBE}?model_id=${entry.model}&audio_format=pcm_16000` +
          `&commit_strategy=turn_prediction` +
          languageCode(settings.language),
        { "xi-api-key": apiKey },
        source,
        signal,
      );

    return {
      ...entry,
      type: "verbatim",
      id: entry.id,
      tune: entry.tune,
      channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
      via: { stream: transcribe },
    };
  }

  const TYPES = { speech: makeSpeech, verbatim: makeVerbatim };

  return service.faculties.map((entry) => TYPES[entry.type](entry));
}
