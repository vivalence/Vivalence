export const stdio = (handle) => async () => {
  const reader = Deno.stdin.readable.pipeThrough(new TextDecoderStream()).getReader()
  const encoder = new TextEncoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    const lines = buffer.split("\n")
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.trim()) continue
      const response = await handle(JSON.parse(line))
      if (response) {
        await Deno.stdout.write(encoder.encode(JSON.stringify(response) + "\n"))
      }
    }
  }
}
