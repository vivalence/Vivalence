const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function* lines(source) {
  for await (const item of source) {
    yield `data: ${typeof item === "string" ? item : JSON.stringify(item)}\n\n`;
  }
}

export function encode(source) {
  const iterator = lines(source)[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) return controller.close();
      controller.enqueue(encoder.encode(value));
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}

export async function* frames(readable) {
  const reader = readable.getReader();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += typeof value === "string" ? value : decoder.decode(value, { stream: true });
      const framed = buffer.split("\n\n");
      buffer = framed.pop();
      for (const frame of framed) {
        const line = frame.split("\n").find((candidate) => candidate.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          yield JSON.parse(payload);
        } catch {
          yield payload;
        }
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {}
  }
}
