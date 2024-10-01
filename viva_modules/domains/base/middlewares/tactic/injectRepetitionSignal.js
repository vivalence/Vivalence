export default async function injectRepetitionSignal(body, ctx) {
  if (body && Array.isArray(body)) {
    if (!body.find((item) => item.type === "SIGNAL" && item.signal === "COMPLETED")) {
      body.push({ type: "SIGNAL", signal: "REPETITION" });
    }
  }
  return body;
}
