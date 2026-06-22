export function turnText(turn) {
  const parts = turn?.parts ?? [];
  return parts
    .filter((part) => part?.type === "text")
    .map((part) => part.text)
    .join("");
}

export function turnTools(turn) {
  const parts = turn?.parts ?? [];
  const uses = parts.filter((part) => part?.type === "tool_use");
  const results = parts.filter((part) => part?.type === "tool_result");
  if (!uses.length) {
    return results.map((result) => ({
      name: result.name ?? "result",
      body: result.output ?? result.content ?? result,
      status: result.is_error ? "error" : "ok",
    }));
  }
  return uses.map((use) => {
    const result = results.find((part) => (part.tool_use_id ?? part.id) === use.id);
    return {
      name: use.name ?? use.id ?? "tool",
      body: result?.output ?? result?.content ?? use.input ?? use,
      status: result ? (result.is_error ? "error" : "ok") : "running",
    };
  });
}

export function turnArtifacts(turn) {
  const parts = turn?.parts ?? [];
  return parts.filter(
    (part) =>
      part?.type === "image" ||
      part?.type === "audio" ||
      part?.type === "file" ||
      part?.type === "artifact",
  );
}
