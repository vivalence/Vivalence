<script>
  import { getContext } from "svelte";
  import { BOX } from "$client";
  import Section from "./Section.svelte";

  const box = getContext(BOX);
  const microphone = box.device.microphone;
  const speaker = box.device.speaker;

  let micClaimed = $state(microphone.claimed);
  let micPermission = $state(microphone.permission);
  let micLevel = $state(microphone.level);
  let micError = $state(microphone.error);
  let micSpeaking = $state(microphone.speaking);
  let micPaused = $state(microphone.paused);
  let spkClaimed = $state(speaker.claimed);
  let spkPlaying = $state(speaker.playing);
  let spkError = $state(speaker.error);

  microphone.$claimed.subscribe((v) => (micClaimed = v));
  microphone.$permission.subscribe((v) => (micPermission = v));
  microphone.$level.subscribe((v) => (micLevel = v));
  microphone.$error.subscribe((v) => (micError = v));
  microphone.$speaking.subscribe((v) => (micSpeaking = v));
  microphone.$paused.subscribe((v) => (micPaused = v));
  speaker.$claimed.subscribe((v) => (spkClaimed = v));
  speaker.$playing.subscribe((v) => (spkPlaying = v));
  speaker.$error.subscribe((v) => (spkError = v));

  const micLabel = $derived(
    micPermission === "denied" ? "blocked"
    : !micClaimed ? "off"
    : micPaused ? "muted"
    : micSpeaking ? "listening"
    : "ready",
  );
  const spkLabel = $derived(
    !spkClaimed ? "off"
    : spkPlaying ? "playing"
    : "ready",
  );

  function tone() {
    const rate = box.drivers.audio.acquire().sampleRate;
    const samples = rate * 0.3;
    const frame = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      frame[i] = Math.sin((2 * Math.PI * 440 * i) / rate) * 0.2;
    }
    speaker.out.enqueue(frame);
  }
</script>

<Section name="box" meta="mic + speaker">
  <div class="group">
    <header class="group-head">
      <span class="group-name">microphone</span>
      <span class="group-meta">{micLabel}</span>
    </header>
    {#if micClaimed}
      <div class="meter">
        <div class="bar" style:width="{Math.min(micLevel * 200, 100)}%"></div>
      </div>
    {/if}
    {#if micError}<div class="error">{micError}</div>{/if}
    <div class="actions">
      <button
        class="act"
        class:on={micClaimed}
        class:danger={micPermission === "denied"}
        onclick={() => (micClaimed ? microphone.release() : microphone.claim())}>
        {micClaimed ? "on" : "off"}
      </button>
      <button
        class="act"
        class:on={micPaused}
        disabled={!micClaimed}
        onclick={() => (micPaused ? microphone.resume() : microphone.pause())}>
        {micPaused ? "muted" : "live"}
      </button>
    </div>
  </div>

  <div class="group">
    <header class="group-head">
      <span class="group-name">speaker</span>
      <span class="group-meta">{spkLabel}</span>
    </header>
    {#if spkError}<div class="error">{spkError}</div>{/if}
    <div class="actions">
      <button
        class="act"
        class:on={spkClaimed}
        onclick={() => (spkClaimed ? speaker.release() : speaker.claim())}>
        {spkClaimed ? "on" : "off"}
      </button>
      <button class="act" disabled={!spkClaimed} onclick={tone}>tone</button>
      <button class="act" disabled={!spkClaimed} onclick={() => speaker.flush()}>flush</button>
    </div>
  </div>
</Section>

<style>
  .group + .group {
    border-top: 1px dashed var(--colors-skeleton-2-boundary);
    margin-top: 4px;
    padding-top: 4px;
  }
  .group-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 4px 16px 2px;
  }
  .group-name {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.55;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .group-meta {
    flex: 1;
    text-align: right;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.85;
    font-size: 10px;
  }
  .error {
    padding: 2px 16px 4px;
    color: var(--colors-skeleton-0-danger-base);
    font-size: 9px;
  }
  .meter {
    height: 4px;
    margin: 6px 16px 4px;
    background: var(--colors-skeleton-1-surface);
    overflow: hidden;
    border-radius: 1px;
  }
  .bar {
    height: 100%;
    background: var(--colors-skeleton-2-primary-base);
    transition: width 0.06s linear;
  }
</style>
