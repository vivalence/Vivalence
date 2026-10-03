<script>
  import { getContext } from "svelte";
  import { Key, Meter } from "@vivalence/drapes";
  import { BOX } from "$client";
  import Card from "../../c/cards/Card.svelte";

  let { ...chrome } = $props();

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

<Card label="box" meta="mic + speaker" {...chrome}>
  <div class="card-stack">
  <div class="card-group">
    <span class="card-name">microphone · {micLabel}</span>
    {#if micClaimed}<Meter value={micLevel * 2} />{/if}
    {#if micError}<span class="fault">{micError}</span>{/if}
    <div class="verbs">
      <Key
        size="row"
        led
        latched={micClaimed}
        tone={micPermission === "denied" ? "negative" : "plain"}
        label={micClaimed ? "on" : "off"}
        onclick={() => (micClaimed ? microphone.release() : microphone.claim())} />
      <Key
        size="row"
        led
        latched={micPaused}
        disabled={!micClaimed}
        label={micPaused ? "muted" : "live"}
        onclick={() => (micPaused ? microphone.resume() : microphone.pause())} />
    </div>
  </div>
  <div class="card-group">
    <span class="card-name">speaker · {spkLabel}</span>
    {#if spkError}<span class="fault">{spkError}</span>{/if}
    <div class="verbs">
      <Key
        size="row"
        led
        latched={spkClaimed}
        label={spkClaimed ? "on" : "off"}
        onclick={() => (spkClaimed ? speaker.release() : speaker.claim())} />
      <Key size="row" disabled={!spkClaimed} label="tone" onclick={tone} />
      <Key size="row" disabled={!spkClaimed} label="flush" onclick={() => speaker.flush()} />
    </div>
  </div>
  </div>
</Card>

<style>
  .verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .fault {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--signal-negative-ink);
  }
</style>
