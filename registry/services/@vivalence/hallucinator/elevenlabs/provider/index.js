export default async function provider(service) {
  const apiKey = service.secrets.elevenlabs;

  const voices = {
    luiza:   { id: "21m00Tcm4TlvDq8ikWAM", tune: [0.3, 0.6, 0.4, 0.1] },
    leandro: { id: "EXAVITQu4vr4xnSDxMaL", tune: [0.5, 0.5, 0.5, 0.1] },
  };

  function makeSpeech(voice) {
    const stream = async function* (textChunks, config = {}) {
      const url =
        `wss://api.elevenlabs.io/v1/text-to-speech/${voice.id}/stream-input` +
        `?model_id=eleven_turbo_v2_5&output_format=ulaw_8000`;
      const ws = new WebSocket(url);
      await new Promise((open, fail) => {
        ws.onopen  = open;
        ws.onerror = fail;
      });
      ws.send(JSON.stringify({
        text: " ",
        voice_settings: {
          stability:        config.stability        ?? 0.5,
          similarity_boost: config.similarityBoost  ?? 0.75,
        },
        xi_api_key: apiKey,
      }));

      const events = [];
      let wake = null;
      ws.addEventListener("message", (event) => {
        events.push(event.data);
        if (wake) { wake(); wake = null; }
      });
      ws.addEventListener("close", () => {
        if (wake) { wake(); wake = null; }
      });

      const pump = (async () => {
        try {
          for await (const chunk of textChunks) {
            if (ws.readyState !== WebSocket.OPEN) break;
            if (!chunk) continue;
            ws.send(JSON.stringify({ text: chunk, try_trigger_generation: true }));
          }
        } finally {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ text: "", flush: true }));
          }
        }
      })();

      try {
        while (ws.readyState === WebSocket.OPEN || events.length) {
          while (events.length) {
            const data = JSON.parse(events.shift());
            if (data.audio)   yield { nature: "packet", audio: data.audio, pts: Date.now() };
            if (data.isFinal) return;
          }
          if (ws.readyState !== WebSocket.OPEN) break;
          await new Promise((resolve) => { wake = resolve; });
        }
      } finally {
        if (ws.readyState === WebSocket.OPEN) ws.close();
        await pump.catch(() => {});
      }
    };

    return {
      type:     "speech",
      tune:     voice.tune,
      context:  0,
      channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "ulaw_8000" }] },
      config:   { voice: voice.id },
      via:      { stream },
    };
  }

  return Object.values(voices).map(makeSpeech);
}
