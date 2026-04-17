export default async function provider(service) {
  const apiKey = service.secrets.deepgram;

  const profiles = {
    "pt-BR": { tune: [0.4, 0.6, 0.5, 0.1], language: "pt" },
    "en":    { tune: [0.4, 0.6, 0.5, 0.1], language: "en" },
  };

  function makeVerbatim(profile) {
    const stream = async function* (audioSource, config = {}) {
      const url =
        `wss://api.deepgram.com/v1/listen?` +
        `encoding=mulaw&sample_rate=8000&language=${profile.language}&` +
        `vad_events=true&endpointing=${config.endpointing ?? 300}&interim_results=true`;
      const ws = new WebSocket(url, ["token", apiKey]);
      await new Promise((open, fail) => {
        ws.onopen  = open;
        ws.onerror = fail;
      });

      const events = [];
      let wake = null;

      ws.addEventListener("message", (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }
        if (data.type === "SpeechStarted") events.push({ nature: "turn.start" });
        if (data.type === "UtteranceEnd")  events.push({ nature: "turn.end"   });
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript) {
          events.push({
            nature:     data.is_final ? "final" : "partial",
            transcript,
          });
        }
        if (wake) { wake(); wake = null; }
      });

      ws.addEventListener("close", () => {
        if (wake) { wake(); wake = null; }
      });

      const pump = (async () => {
        try {
          for await (const audio of audioSource) {
            if (ws.readyState !== WebSocket.OPEN) break;
            ws.send(audio);
          }
        } finally {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "CloseStream" }));
          }
        }
      })();

      try {
        while (ws.readyState === WebSocket.OPEN || events.length) {
          while (events.length) yield events.shift();
          if (ws.readyState !== WebSocket.OPEN) break;
          await new Promise((resolve) => { wake = resolve; });
        }
      } finally {
        if (ws.readyState === WebSocket.OPEN) ws.close();
        await pump.catch(() => {});
      }
    };

    return {
      type:     "verbatim",
      tune:     profile.tune,
      context:  0,
      channels: { in: [{ type: "audio", codec: "ulaw_8000" }], out: [{ type: "event" }] },
      config:   { language: profile.language },
      via:      { stream },
    };
  }

  return Object.values(profiles).map(makeVerbatim);
}
