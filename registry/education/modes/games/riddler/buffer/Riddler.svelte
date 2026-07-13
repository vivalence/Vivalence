<script>
  const { terminal, buffer } = $props();

  // O Charlatão — gutted to the bare minimum that RUNS: the jester character, the
  // stage styling, a dev resolve button, and the input wired to the mode aperture
  // /assistant/message (with logs around the call). Everything else was stripped.

  let entry = $state("");
  let thinking = $state(false);
  let phase = $state("idle"); // idle | wrong | solved
  let line = $state("Aproxima-te… tenho um enigma só para ti!");

  const riddle = buffer.data?.riddle ?? "(sem enigma — emita um /riddle primeiro)";

  async function ask(message) {
    if (thinking || !message) return;
    thinking = true;
    console.log("[riddler] /assistant/message →", { buffer: buffer.id, message });
    try {
      const verdict = await buffer.mode.connection.call("/assistant/message", {
        buffer: buffer.id,
        message,
      });
      console.log("[riddler] /assistant/message ←", verdict);
      line = verdict.message || line;
      phase = verdict.resolved || verdict.resolvable ? "solved" : "wrong";
    } catch (error) {
      console.error("[riddler] /assistant/message ✗", error);
      line = "O Charlatão tropeça nas próprias palavras… tenta de novo.";
    } finally {
      thinking = false;
    }
  }

  function submit() {
    const value = entry.trim();
    if (!value || thinking) return;
    entry = "";
    ask(value);
  }

  function onkeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  // DEV tool — force-resolve the buffer and drop back to the panel.
  async function resolve() {
    console.log("[riddler] /assistant/resolve →", { buffer: buffer.id });
    try {
      const result = await buffer.mode.connection.call("/assistant/resolve", { buffer: buffer.id });
      console.log("[riddler] /assistant/resolve ←", result);
    } catch (error) {
      console.error("[riddler] /assistant/resolve ✗", error);
    } finally {
      terminal.buffer = null;
    }
  }

  const solvedish = $derived(phase === "solved");
  const lineColor = $derived(phase === "wrong" ? "#e88a72" : "#f0d9a0");

  // one state machine drives brows, eyes, mouth, hat, body
  const face = $derived.by(() => {
    if (thinking)
      return { char: "j-bob 3s ease-in-out infinite", hat: "j-sway 3.6s ease-in-out infinite", head: "rotate(-5deg)", browL: "rotate(-8deg) translateY(-4px)", browR: "rotate(4deg)", eyeH: "30px", pupil: "5px", wink: "none", mouth: "grin", grinScale: 0.7 };
    if (phase === "wrong")
      return { char: "j-shake .5s ease", hat: "j-jangle .5s ease", head: "scale(1.05) translateY(6px)", browL: "rotate(20deg) translateY(3px)", browR: "rotate(-20deg) translateY(3px)", eyeH: "20px", pupil: "-4px", wink: "none", mouth: "cackle", grinScale: 1 };
    if (phase === "solved")
      return { char: "j-bounce .7s ease", hat: "j-jangle .6s ease", head: "translateY(-6px) scale(1.05)", browL: "rotate(-14deg) translateY(-6px)", browR: "rotate(14deg) translateY(-6px)", eyeH: "30px", pupil: "0px", wink: "none", mouth: "grin", grinScale: 1.25 };
    return { char: "j-bob 3.2s ease-in-out infinite", hat: "j-sway 3.6s ease-in-out infinite", head: "rotate(0deg)", browL: "rotate(-10deg)", browR: "rotate(6deg)", eyeH: "30px", pupil: "3px", wink: "j-wink 5s ease-in-out infinite", mouth: "grin", grinScale: 1 };
  });
</script>

<div class="stage">
  <div class="devbar">
    <button class="dev" onclick={resolve} title="resolve buffer (dev)">⏻ resolve (dev)</button>
  </div>

  <div class="scene">
    <div class="bust">
      <div style:animation={face.char}>
        <div class="head" style:transform={face.head}>
          <div class="hat-mount">
            <div class="hat" style:animation={face.hat}>
              <div class="point tilt-left">
                <div class="cone red"></div>
                <div class="pom gold"></div>
              </div>
              <div class="point center">
                <div class="cone gold"></div>
                <div class="pom red"></div>
              </div>
              <div class="point tilt-right">
                <div class="cone teal"></div>
                <div class="pom gold"></div>
              </div>
            </div>
          </div>

          <div class="headband"></div>

          <div class="face">
            <div class="brow left-brow" style:transform={face.browL}></div>
            <div class="brow right-brow" style:transform={face.browR}></div>

            <div class="eyes">
              <div class="eye" style:height={face.eyeH} style:animation={face.wink}>
                <div class="pupil" style:transform="translateX({face.pupil})"></div>
              </div>
              <div class="eye" style:height={face.eyeH}>
                <div class="pupil" style:transform="translateX({face.pupil})"></div>
              </div>
            </div>

            <div class="cheek left-cheek"></div>
            <div class="cheek right-cheek"></div>
            <div class="nose"></div>

            {#if face.mouth === "grin"}
              <div class="grin" style:transform="translateX(-50%) scale({face.grinScale})">
                <div class="tongue"></div>
              </div>
            {:else}
              <div class="cackle">
                <div class="tongue round"></div>
              </div>
            {/if}
          </div>

          <div class="collar">
            <div class="ruff red"></div>
            <div class="ruff gold tall"></div>
            <div class="ruff teal taller"></div>
            <div class="ruff gold tall"></div>
            <div class="ruff red"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="riddle" class:dim={solvedish}>« {riddle} »</div>
    <div class="line" style:color={lineColor}>{line}</div>

    <div class="entry">
      <div class="field" class:wrong={phase === "wrong"}>
        <input
          bind:value={entry}
          placeholder="lança a tua resposta…"
          disabled={thinking}
          {onkeydown} />
        <button class="throw" onclick={submit} aria-label="responder">▸</button>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes j-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-9px); }
  }
  @keyframes j-bounce {
    0% { transform: translateY(0); }
    28% { transform: translateY(-22px); }
    52% { transform: translateY(0); }
    72% { transform: translateY(-9px); }
    100% { transform: translateY(0); }
  }
  @keyframes j-shake {
    0%, 100% { transform: translateX(0); }
    16% { transform: translateX(-9px) rotate(-1.5deg); }
    38% { transform: translateX(9px) rotate(1.5deg); }
    60% { transform: translateX(-6px); }
    82% { transform: translateX(6px); }
  }
  @keyframes j-sway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  @keyframes j-jangle {
    0%, 100% { transform: rotate(0); }
    20% { transform: rotate(-11deg); }
    45% { transform: rotate(9deg); }
    70% { transform: rotate(-6deg); }
    88% { transform: rotate(4deg); }
  }
  @keyframes j-wink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.12); }
  }

  .stage {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: radial-gradient(75% 46% at 50% -4%, rgba(255, 224, 150, 0.18), transparent 55%),
      linear-gradient(#3c0e1f 0%, #250913 58%, #150407 100%);
    color: #f7ecd8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  /* dev bar */
  .devbar {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 30;
  }
  .dev {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px dashed rgba(240, 192, 74, 0.4);
    background: rgba(255, 246, 230, 0.06);
    color: #e4b34a;
    font-family: var(--font-family-code, monospace);
    font-size: 11px;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .scene {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 44px 40px 22px;
    text-align: center;
    overflow: hidden;
  }

  /* ── the jester ── */
  .bust {
    position: relative;
    flex: 0 0 auto;
    margin-top: 6px;
    height: 270px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
  .head {
    position: relative;
    width: 240px;
    transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  .hat-mount {
    position: absolute;
    left: 50%;
    top: -6px;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transform-origin: bottom center;
  }
  .hat {
    transform-origin: bottom center;
    display: flex;
    align-items: flex-end;
  }
  .point {
    position: relative;
    transform-origin: bottom center;
  }
  .point.tilt-left { transform: rotate(-34deg); }
  .point.center { transform: translateY(6px); z-index: 2; }
  .point.tilt-right { transform: rotate(34deg); }
  .cone {
    width: 0;
    height: 0;
    border-left: 24px solid transparent;
    border-right: 24px solid transparent;
    border-bottom: 64px solid #d13a4a;
  }
  .point.center .cone {
    border-left-width: 26px;
    border-right-width: 26px;
    border-bottom-width: 72px;
  }
  .cone.gold { border-bottom-color: #f0c04a; }
  .cone.teal { border-bottom-color: #2f9e8f; }
  .cone.red { border-bottom-color: #d13a4a; }
  .pom {
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 15px;
    border-radius: 50%;
  }
  .point.center .pom { top: -10px; width: 16px; height: 16px; }
  .pom.gold { background: #f0c04a; box-shadow: inset -2px -2px 3px #b5852a; }
  .pom.red { background: #d13a4a; box-shadow: inset -2px -2px 3px #8f1420; }

  .headband {
    position: absolute;
    left: 50%;
    top: 52px;
    transform: translateX(-50%);
    width: 158px;
    height: 26px;
    border-radius: 14px;
    background: repeating-linear-gradient(66deg, #f0c04a, #f0c04a 15px, #d13a4a 15px, #d13a4a 30px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
    z-index: 3;
  }

  .face {
    position: absolute;
    left: 50%;
    top: 64px;
    transform: translateX(-50%);
    width: 158px;
    height: 170px;
    border-radius: 50% 50% 48% 48%;
    background: radial-gradient(70% 65% at 50% 38%, #f7ecd6, #ecdcbc);
    box-shadow:
      0 14px 30px rgba(0, 0, 0, 0.4),
      inset 0 -10px 20px rgba(180, 140, 90, 0.25);
  }
  .brow {
    position: absolute;
    top: 52px;
    width: 34px;
    height: 7px;
    border-radius: 5px;
    background: #3a2416;
    transition: transform 0.4s;
  }
  .left-brow { left: 34px; }
  .right-brow { right: 34px; }

  .eyes {
    position: absolute;
    left: 0;
    right: 0;
    top: 66px;
    display: flex;
    justify-content: center;
    gap: 26px;
  }
  .eye {
    width: 30px;
    border-radius: 50%;
    background: #fff;
    box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.2);
    display: grid;
    place-items: center;
    transform-origin: center;
  }
  .pupil {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #241a12;
  }

  .cheek {
    position: absolute;
    top: 96px;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background: #e0768a;
    opacity: 0.7;
    border-radius: 3px;
  }
  .left-cheek { left: 16px; }
  .right-cheek { right: 16px; }
  .nose {
    position: absolute;
    left: 50%;
    top: 92px;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e8b7a0;
  }

  .grin {
    position: absolute;
    left: 50%;
    bottom: 20px;
    width: 76px;
    height: 40px;
    background: #5a1220;
    border-radius: 0 0 76px 76px;
    box-shadow:
      inset 0 6px 0 #fff,
      inset 0 -8px 10px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }
  .grin .tongue {
    position: absolute;
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
    width: 30px;
    height: 14px;
    background: #d13a4a;
    border-radius: 30px 30px 8px 8px;
  }
  .cackle {
    position: absolute;
    left: 50%;
    bottom: 14px;
    transform: translateX(-50%);
    width: 58px;
    height: 56px;
    background: #4a0d18;
    border-radius: 50%;
    box-shadow:
      inset 0 6px 0 #fff,
      inset 0 -6px 0 #fff;
    overflow: hidden;
  }
  .cackle .tongue.round {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    width: 26px;
    height: 20px;
    background: #d13a4a;
    border-radius: 50%;
  }

  .collar {
    position: absolute;
    left: 50%;
    top: 224px;
    transform: translateX(-50%);
    display: flex;
    z-index: 2;
  }
  .ruff {
    width: 0;
    height: 0;
    border-left: 16px solid transparent;
    border-right: 16px solid transparent;
    border-top: 30px solid #d13a4a;
  }
  .ruff.gold { border-top-color: #f0c04a; }
  .ruff.teal { border-top-color: #2f9e8f; }
  .ruff.tall { border-top-width: 34px; }
  .ruff.taller { border-top-width: 38px; }

  /* ── text ── */
  .riddle {
    margin-top: 16px;
    max-width: 26rem;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    font-size: 1.4rem;
    line-height: 1.25;
    color: #f7ecd8;
    text-wrap: balance;
    transition: opacity 0.3s;
  }
  .riddle.dim { opacity: 0.45; }
  .line {
    margin-top: 8px;
    min-height: 1.2em;
    max-width: 24rem;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    font-size: 1.2rem;
    line-height: 1.3;
    text-wrap: balance;
    opacity: 0.82;
    transition: color 0.3s;
  }

  /* ── input ── */
  .entry {
    margin-top: 22px;
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .field {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 6px 6px 18px;
    background: rgba(255, 246, 230, 0.06);
    border: 1px solid rgba(240, 192, 74, 0.22);
    border-radius: 12px;
    transition: border-color 0.25s;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
  .field.wrong { border-color: #d13a4a; }
  .field input {
    flex: 1;
    min-width: 0;
    padding: 8px 0;
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 1.3rem;
    color: #f7ecd8;
    background: transparent;
    border: none;
    outline: none;
  }
  .field input::placeholder {
    color: rgba(247, 236, 216, 0.35);
    font-style: italic;
  }
  .throw {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    background: #f0c04a;
    color: #3c0e1f;
    font-size: 15px;
    display: grid;
    place-items: center;
    box-shadow: 0 0 18px rgba(240, 192, 74, 0.4);
  }
</style>
