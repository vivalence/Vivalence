// limit: 3000 chars · the stream-input socket fed like a mind: 4 chars every 25 ms; argv[0] = "flush" sends flush:true after the first clause; prints ms from socket creation; argv[1] = a path, the pcm lands there as s16le 16 kHz mono
import * as dotenv from "@std/dotenv";
const { SECRET_VIVA_ELEVENLABS_API_KEY: key } = await dotenv.load({ envPath: `${Deno.env.get("HOME")}/.viva/.env` });

const REPLIES = {
  short: "¡Eso! Pan. Now say: I eat bread.",
  long: "¡Muy bien! Pan is bread. In Spanish we say 'como pan' for 'I eat bread'. Now you try it with water: how do you say 'I drink water'?",
};
const CLAUSE = /[.!?,;:]/;
const url = "wss://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream-input?model_id=eleven_flash_v2_5&output_format=pcm_16000";

async function run(name, flushing, sink) {
  const text = REPLIES[name];
  const t0 = performance.now();
  const at = () => Math.round(performance.now() - t0);
  const seen = { reply: name, chars: text.length, flushing };
  const ws = new WebSocket(url);
  const pcm = [];
  const done = new Promise((resolve) => {
    ws.onclose = (event) => resolve(event.code);
    ws.onerror = (event) => resolve(`error ${event.message ?? ""}`);
  });
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.error) seen.fault = `${data.error}: ${data.message}`;
    if (data.audio) {
      seen.firstAudio ??= at();
      seen.packets = (seen.packets ?? 0) + 1;
      pcm.push(Uint8Array.from(atob(data.audio), (char) => char.charCodeAt(0)));
    }
    if (data.isFinal) {
      seen.final = at();
      ws.close();
    }
  };
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  seen.open = at();
  ws.send(JSON.stringify({ text: " ", voice_settings: { stability: 0.5, similarity_boost: 0.75 }, xi_api_key: key }));
  let sent = "";
  let flushed = false;
  for (let offset = 0; offset < text.length; offset += 4) {
    const chunk = text.slice(offset, offset + 4);
    sent += chunk;
    seen.firstText ??= at();
    const flush = flushing && !flushed && CLAUSE.test(chunk) && sent.length >= 10;
    if (flush) {
      flushed = true;
      seen.flushAt = at();
      seen.flushedText = sent;
    }
    ws.send(JSON.stringify({ text: chunk, try_trigger_generation: true, ...(flush && { flush: true }) }));
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  seen.textEnd = at();
  ws.send(JSON.stringify({ text: "" }));
  const guard = setTimeout(() => ws.readyState === 1 && ws.close(), 15000);
  seen.close = await done;
  clearTimeout(guard);
  seen.audioBeforeTextEnd = seen.firstAudio !== undefined && seen.firstAudio < seen.textEnd;
  if (sink) await Deno.writeFile(`${sink}.${name}.${flushing ? "flush" : "plain"}.pcm`, Uint8Array.from(pcm.flatMap((bytes) => [...bytes])));
  console.log(JSON.stringify(seen));
}

const flushing = Deno.args[0] === "flush";
for (const name of ["short", "long"]) await run(name, flushing, Deno.args[1]);
