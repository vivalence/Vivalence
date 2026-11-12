// limit: 2000 chars · the raw stream-input socket: every message and the close, no provider in between; argv[0] "eos" ends the input with a bare empty text
import * as dotenv from "@std/dotenv";
const { SECRET_VIVA_ELEVENLABS_API_KEY: key } = await dotenv.load({ envPath: `${Deno.env.get("HOME")}/.viva/.env` });
const url = "wss://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream-input?model_id=eleven_flash_v2_5&output_format=pcm_16000";
const ws = new WebSocket(url);
const t0 = performance.now();
const at = () => Math.round(performance.now() - t0);
ws.onopen = () => {
  console.log(at(), "open");
  ws.send(JSON.stringify({ text: " ", voice_settings: { stability: 0.5, similarity_boost: 0.75 }, xi_api_key: key }));
  ws.send(JSON.stringify({ text: "Vado al mercato.", try_trigger_generation: true }));
  ws.send(JSON.stringify(Deno.args[0] === "eos" ? { text: "" } : { text: "", flush: true }));
};
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(at(), "message", JSON.stringify({ ...data, audio: data.audio ? `<${data.audio.length} b64>` : data.audio }).slice(0, 400));
};
ws.onerror = (event) => console.log(at(), "error", event.message ?? "");
ws.onclose = (event) => console.log(at(), "close", event.code, event.reason);
setTimeout(() => ws.readyState === 1 && ws.close(), 15000);
