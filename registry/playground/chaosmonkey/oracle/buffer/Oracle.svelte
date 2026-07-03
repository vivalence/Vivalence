<script>
  import { v } from "@vivalence/typology";

  let prompt = $state("");
  let viaAperture = $state("");
  let viaHarness = $state("");
  let pendingAperture = $state(false);
  let pendingHarness = $state(false);
  let route = $state("aperture"); // "aperture" | "harness" — which of the two demo paths this submit takes

  const { buffer, terminal } = $props();

  // interaction 1 — exposed aperture (/ask) that internally calls harness.object.render.
  // turn persistence for this route is registered daemon-side, inside the aperture handler.
  async function askAperture() {
    if (!prompt.trim() || pendingAperture) return;
    pendingAperture = true;
    try {
      const result = await buffer.mode.call("/ask", { prompt, thread: terminal.thread?.id });
      viaAperture = result?.answer ?? "";
    } catch (e) {
      console.error("askAperture", { error: e });
    } finally {
      pendingAperture = false;
    }
  }

  // interaction 2 — the strip-wired harness, called directly from the client. No aperture
  // in between, so the app owns the round trip — turn persistence is registered here,
  // manually, app-side.
  async function askHarness() {
    if (!prompt.trim() || pendingHarness) return;
    pendingHarness = true;
    try {
      const result = await buffer.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: prompt }] }],
        config: { schema: v.object({ answer: v.string() }) },
      });
      viaHarness = result?.object?.answer ?? "";

      const threadId = terminal.thread?.id;
      if (threadId && result?.object) {
        const turns = buffer.mode.daemon.entities.turn;
        const history = await turns.find({ thread: threadId }, { orderBy: { createdAt: "ASC" } });
        const userTurn = await turns.create({
          role: "user",
          parts: [{ type: "text", text: prompt }],
          parent: history.at(-1)?.id ?? null,
          thread: threadId,
          mode: buffer.mode.id,
        });
        await turns.create({
          role: "assistant",
          parts: [
            { type: "text", text: result.object?.answer ?? "" },
            { type: "object", data: result.object },
          ],
          parent: userTurn.id,
          thread: threadId,
          mode: buffer.mode.id,
        });
      }
    } catch (e) {
      console.error("askHarness", { error: e });
    } finally {
      pendingHarness = false;
    }
  }
</script>

<div class="oracle">
  <form
    onsubmit={(event) => {
      event.preventDefault();
      if (route === "aperture") askAperture();
      else askHarness();
    }}>
    <input
      type="text"
      bind:value={prompt}
      placeholder="ask the oracle"
      disabled={pendingHarness || pendingAperture} />
    <label class="choice">
      <input type="radio" name="route" value="aperture" bind:group={route} />
      aperture
    </label>
    <label class="choice">
      <input type="radio" name="route" value="harness" bind:group={route} />
      harness
    </label>
    <button type="submit" disabled={pendingHarness || pendingAperture}>ask</button>
  </form>
  <div class="answer"><span class="label">via aperture:</span> {viaAperture || "…"}</div>
  <div class="answer"><span class="label">via harness:</span> {viaHarness || "…"}</div>
</div>

<style>
  .oracle {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8rem;
    padding: 1rem;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
  }
  .answer {
    font-size: var(--font-size-sm);
    min-height: 1.4em;
  }
  .label {
    opacity: 0.6;
    margin-right: 0.4em;
  }
  form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .choice {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--font-size-xs);
    opacity: 0.8;
    white-space: nowrap;
  }
  input {
    flex: 1;
    font: inherit;
    padding: 0.4rem 0.6rem;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 0.3rem;
    color: inherit;
  }
  button {
    padding: 0.4rem 1.1rem;
    font: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 0.3rem;
    cursor: pointer;
  }
  button:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
</style>
